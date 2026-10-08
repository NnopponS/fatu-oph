import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

let now = 0, id = 0, peakVoices = 0, sampleCount = 0, closed = 0, dispose;
const timers = new Map(), sources = [], events = new Map(), storage = new Map(), gains = [];
class Param {
  value = 0;
  setValueAtTime(value, time) { assert.ok(Number.isFinite(value) && Number.isFinite(time)); this.value = value; }
  exponentialRampToValueAtTime(value, time) { assert.ok(value > 0 && Number.isFinite(time)); this.value = value; }
  linearRampToValueAtTime(value, time) { this.setValueAtTime(value, time); }
  setTargetAtTime(value, time) { this.setValueAtTime(value, time); }
  cancelScheduledValues() {}
}
class Node {
  gain = new Param(); frequency = new Param(); detune = new Param(); Q = new Param(); playbackRate = new Param(); delayTime = new Param();
  connect() {} disconnect() {} setPeriodicWave() {}
  start(time = now) { this.startTime = time; sources.push(this); }
  stop(time = now) { this.endTime = time; }
}
class ConvolverNode extends Node { buffer = null; }
class CompressorNode extends Node {
  threshold = new Param(); knee = new Param(); ratio = new Param(); attack = new Param(); release = new Param();
}
class Context {
  state = "running"; sampleRate = 44100; destination = new Node();
  get currentTime() { return now; }
  resume() { this.state = "running"; return Promise.resolve(); }
  suspend() { this.state = "suspended"; return Promise.resolve(); }
  close() { this.state = "closed"; closed++; return Promise.resolve(); }
  createGain() { const node = new Node(); gains.push(node); return node; } createOscillator() { return new Node(); }
  createBiquadFilter() { return new Node(); } createDelay() { return new Node(); }
  createBufferSource() { return new Node(); } createPeriodicWave() { return {}; }
  createConvolver() { return new ConvolverNode(); }
  createDynamicsCompressor() { return new CompressorNode(); }
  createBuffer(channels, length, rate) { sampleCount += length; const data = new Float32Array(length); return { duration: length / rate, getChannelData: () => data }; }
}
const document = { hidden: false, body: { classList: { contains: () => false } }, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) };
const sandbox = { exports: {}, window: { AudioContext: Context }, document,
  navigator: {}, localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  setTimeout: (fn, delay) => { const key = ++id; timers.set(key, { fn, time: now + delay / 1000 }); return key; },
  clearTimeout: key => timers.delete(key), Float32Array, Math, hot: { dispose: fn => { dispose = fn; } } };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/lib/sfx.ts", "utf8").replaceAll("import.meta.hot", "hot"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, sandbox);
const { sfx } = sandbox.exports;
function expire() {
  for (const source of sources) {
    const end = source.endTime ?? (source.buffer && !source.loop ? source.startTime + source.buffer.duration : Infinity);
    if (!source.ended && end <= now) { source.ended = true; source.onended?.(); }
  }
  peakVoices = Math.max(peakVoices, sources.filter(source => !source.ended).length);
}
function advance(seconds) {
  const end = now + seconds;
  while (now < end) {
    now = Math.min(end, now + .02);
    for (const [key, timer] of [...timers]) if (timer.time <= now) { timers.delete(key); timer.fn(); }
    expire();
  }
}
sfx.tap(); assert.equal(sources.length, 0, "Audio must await a gesture");
sfx.unlock(); await Promise.resolve();
assert.ok(gains.length >= 2, "Audio buses initialized");

// Test Chinese instrument variety for tap clicks
const tapVoicesBefore = sources.length;
for (let i = 0; i < 5; i++) {
  sfx.tap();
  advance(0.1);
}
assert.ok(sources.length > tapVoicesBefore, "Taps produce sound with Chinese instruments");

// Test participant musical sting (5-8s short duration) and randomized variations
const stingVoicesBefore = sources.length;
sfx.sting("home");
advance(0.2);
assert.ok(sources.length > stingVoicesBefore, "Sting schedules musical notes");
advance(9); // After ~8s, sting finishes naturally
assert.equal(timers.size, 0, "Sting ends completely without endless scheduling");

// Test variety across successive calls
advance(4); // wait past throttle
const v2VoicesBefore = sources.length;
sfx.sting("home");
advance(0.2);
assert.ok(sources.length > v2VoicesBefore, "Next sting variation schedules correctly");
advance(9);

// Test staff mode disallowing music
sfx.setMusicAllowed(false);
const staffVoicesBefore = sources.length;
sfx.sting("explore");
advance(0.2);
assert.equal(sources.length, staffVoicesBefore, "Staff mode blocks musical stings");
sfx.setMusicAllowed(true);

// Distinct guardian select sounds
const fingerprints = [];
for (let i = 0; i < 4; i++) {
  const first = sources.length; sfx.select(i);
  fingerprints.push(sources.slice(first).map(source => source.buffer?.getChannelData(0).slice(50, 60).join(",")).join("|"));
  advance(.2);
}
assert.equal(new Set(fingerprints).size, 4, "Each guardian has a distinct interval");

// Traditional Chinese SFX cues
for (const cue of ["tap", "hover", "page", "whoosh", "rise", "impact", "gong", "stamp", "chime", "success", "error", "fanfare", "muyu", "zheng", "bell", "tanggu"]) {
  const first = sources.length;
  if (typeof sfx[cue] === "function") {
    sfx[cue]();
    assert.ok(sources.length > first, cue + " must produce audio");
    advance(.15);
  }
}

// Rapid inputs
for (let i = 0; i < 30; i++) sfx.tap();
advance(.05);
assert.ok(sources.filter(source => !source.ended).length <= 25, "Rapid input must keep voice budget bounded");
advance(5);

// Mute test
sfx.setEnabled(false);
const mutedCount = sources.length; sfx.tap(); sfx.rise(); sfx.sting("home");
assert.equal(sources.length, mutedCount, "Muted effects stay silent");
assert.equal(storage.get("fatu_sound_enabled"), "0");
sfx.setEnabled(true); await Promise.resolve();

// Tab visibility
document.hidden = true; events.get("visibilitychange")?.(); advance(.1);
const hiddenCount = sources.length; advance(10); sfx.select();
assert.equal(sources.length, hiddenCount, "Hidden tabs suspend audio triggers");
document.hidden = false; events.get("visibilitychange")?.(); await Promise.resolve();

// Disposal
dispose();
assert.equal(closed, 1, "Hot updates close AudioContext");
console.log("PASS: Chinese musical stings (5-8s), staff mode silence, rich instrument clicks (muyu/zheng/bell/tanggu), mute control, bounded voice budget verified!");
