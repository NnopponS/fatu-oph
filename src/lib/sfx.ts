/**
 * Procedural Chinese sound design (no audio files).
 * Instruments: guzheng (Karplus-Strong), dizi flute, muyu woodblock, bianzhong bell,
 * bo cymbal, tanggu drum, gong and silk-fan swish.
 * Music is a short 5–8 s "sting" played on page change — never a continuous loop —
 * and only for the participant experience (staff/admin stay silent).
 */
const STORAGE_KEY = "fatu_sound_enabled";
// D major pentatonic (gong-shang-jue-zhi-yu), D3 … D6
const P = [146.83, 164.81, 185, 220, 246.94, 293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99, 880, 987.77, 1174.66];

export type StingKind = "home" | "explore" | "pass" | "reward" | "story" | "info";

let ctx: AudioContext | null = null;
let master: GainNode;
let sfxBus: GainNode;
let musicBus: GainNode;
let reverbSend: GainNode;
let noiseBuffer: AudioBuffer;
let enabled = readEnabled();
let unlocked = false;
let musicAllowed = true;
let lastSting = -10;
let lastTap = -1;
let tapIndex = 0;
let visibilityHandler: (() => void) | undefined;
const listeners = new Set<() => void>();
const strings = new Map<number, AudioBuffer>();
const musicVoices = new Set<AudioScheduledSourceNode>();
const effectVoices = new Set<AudioScheduledSourceNode>();

function readEnabled() {
  try { return localStorage.getItem(STORAGE_KEY) !== "0"; } catch { return true; }
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try { ctx = new Ctor(); } catch { return null; }
  const c = ctx;
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -12; limiter.knee.value = 14; limiter.ratio.value = 6;
  limiter.attack.value = .003; limiter.release.value = .25; limiter.connect(c.destination);
  master = c.createGain(); master.gain.value = enabled ? .85 : 0; master.connect(limiter);
  sfxBus = c.createGain(); sfxBus.gain.value = .75; sfxBus.connect(master);
  musicBus = c.createGain(); musicBus.gain.value = .55; musicBus.connect(master);

  // Cheap "temple hall" reverb: short noise impulse, generated once.
  const convolver = c.createConvolver();
  const len = Math.floor(c.sampleRate * 2.2);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  convolver.buffer = ir;
  reverbSend = c.createGain(); reverbSend.gain.value = .32;
  const wet = c.createGain(); wet.gain.value = .5;
  reverbSend.connect(convolver); convolver.connect(wet); wet.connect(master);

  noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  visibilityHandler = () => {
    if (!ctx || !unlocked) return;
    if (document.hidden) { sfx.stopMusic(false); void ctx.suspend().catch(() => {}); }
    else if (enabled) void ctx.resume().catch(() => {});
  };
  document.addEventListener("visibilitychange", visibilityHandler);
  return c;
}

function live(): AudioContext | null {
  if (!enabled || !unlocked || typeof document === "undefined" || document.hidden) return null;
  const c = ensure();
  if (c?.state === "suspended") void c.resume().catch(() => {});
  return c;
}

function track(source: AudioScheduledSourceNode, nodes: AudioNode[], music: boolean) {
  const voices = music ? musicVoices : effectVoices;
  voices.add(source);
  const cap = music ? 48 : 22;
  if (voices.size > cap) {
    const oldest = voices.values().next().value;
    if (oldest) { try { oldest.stop(ctx!.currentTime + .02); } catch { /* ended */ } voices.delete(oldest); }
  }
  source.onended = () => { voices.delete(source); try { source.disconnect(); nodes.forEach(n => n.disconnect()); } catch { /* gone */ } };
}

const isMusic = (dest: AudioNode) => dest === musicBus;

function out(g: GainNode, dest: AudioNode, wet = 0) {
  g.connect(dest);
  if (wet > 0) { const s = ctx!.createGain(); s.gain.value = wet; g.connect(s); s.connect(reverbSend); return [s]; }
  return [];
}

function tone(c: AudioContext, type: OscillatorType, f: number, t: number, dur: number, peak: number, opts: { to?: number; dest?: AudioNode; wet?: number; attack?: number } = {}) {
  const dest = opts.dest ?? sfxBus;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + (opts.attack ?? .005));
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); const extra = out(g, dest, opts.wet);
  track(o, [g, ...extra], isMusic(dest)); o.start(t); o.stop(t + dur + .03);
}

function hiss(c: AudioContext, t: number, dur: number, peak: number, from: number, to: number, opts: { dest?: AudioNode; attack?: number; q?: number; type?: BiquadFilterType; wet?: number } = {}) {
  const dest = opts.dest ?? sfxBus;
  const s = c.createBufferSource(); s.buffer = noiseBuffer; s.loop = true;
  s.playbackRate.value = .8 + Math.random() * .4;
  const f = c.createBiquadFilter(); f.type = opts.type ?? "bandpass"; f.Q.value = opts.q ?? .9;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + dur * (opts.attack ?? .4)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); const extra = out(g, dest, opts.wet);
  track(s, [f, g, ...extra], isMusic(dest)); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
}

/** Guzheng string: Karplus-Strong buffer cached per pitch. */
function zheng(c: AudioContext, f: number, t: number, peak: number, opts: { dest?: AudioNode; bend?: number; wet?: number } = {}) {
  const dest = opts.dest ?? sfxBus;
  let buffer = strings.get(f);
  if (!buffer) {
    buffer = c.createBuffer(1, Math.ceil(c.sampleRate * 2.6), c.sampleRate);
    const data = buffer.getChannelData(0);
    const period = Math.max(2, Math.round(c.sampleRate / f));
    const str = new Float32Array(period); let avg = 0;
    for (let i = 0; i < period; i++) { str[i] = Math.random() * 2 - 1; avg += str[i] / period; }
    for (let i = 0; i < period; i++) str[i] -= avg;
    const damp = Math.pow(.001, 1 / (f * 2.6));
    for (let i = 0; i < data.length; i++) {
      const k = i % period;
      data[i] = str[k] * Math.min(1, i / (c.sampleRate * .0015));
      str[k] = (str[k] * .55 + str[(k + 1) % period] * .45) * damp;
    }
    strings.set(f, buffer);
  }
  const s = c.createBufferSource(); s.buffer = buffer;
  if (opts.bend) { s.playbackRate.setValueAtTime(1, t + .05); s.playbackRate.linearRampToValueAtTime(opts.bend, t + .28); s.playbackRate.linearRampToValueAtTime(1, t + .6); }
  const g = c.createGain(); g.gain.value = peak;
  s.connect(g); const extra = out(g, dest, opts.wet ?? .5);
  track(s, [g, ...extra], isMusic(dest)); s.start(t);
}

/** Dizi bamboo flute with breath noise and delayed vibrato. */
function dizi(c: AudioContext, f: number, t: number, dur: number, peak: number, dest: AudioNode = musicBus) {
  const o = c.createOscillator(); const g = c.createGain();
  o.setPeriodicWave(c.createPeriodicWave(new Float32Array(6), new Float32Array([0, 1, .32, .1, .05, .02])));
  o.frequency.setValueAtTime(f * .97, t); o.frequency.exponentialRampToValueAtTime(f, t + .1);
  const vib = c.createOscillator(); const depth = c.createGain(); vib.frequency.value = 5.6;
  depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(9, t + Math.min(.5, dur * .6));
  vib.connect(depth); depth.connect(o.detune);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .09);
  g.gain.setValueAtTime(peak * .8, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); const extra = out(g, dest, .6);
  track(o, [g, depth, ...extra], isMusic(dest)); track(vib, [], isMusic(dest));
  hiss(c, t, dur, peak * .12, 3400, 2600, { dest, attack: .15 });
  o.start(t); vib.start(t); o.stop(t + dur + .03); vib.stop(t + dur + .03);
}

/** Muyu temple woodblock — hollow, short, pitched. */
function muyu(c: AudioContext, f: number, t: number, peak: number, dest: AudioNode = sfxBus) {
  tone(c, "sine", f, t, .09, peak, { to: f * .82, dest, wet: .25, attack: .002 });
  tone(c, "triangle", f * 2.7, t, .035, peak * .35, { dest, attack: .001 });
  hiss(c, t, .03, peak * .4, 3000, 1800, { dest, attack: .05, q: 2 });
}

/** Bianzhong bronze bell — inharmonic partials, long shimmer. */
function bell(c: AudioContext, f: number, t: number, peak: number, tail = 2.2, dest: AudioNode = sfxBus) {
  [[1, 1], [2.32, .45], [3.17, .3], [4.1, .18], [5.43, .1]].forEach(([r, a]) =>
    tone(c, "sine", f * r, t, tail / Math.sqrt(r), peak * a, { dest, wet: .7, attack: .003 }));
}

function gongHit(c: AudioContext, t: number, base: number, peak: number, tail: number, dest: AudioNode = sfxBus) {
  [[1, 1], [1.47, .4], [2.09, .32], [2.72, .2], [3.6, .12], [4.95, .07]].forEach(([r, a]) =>
    tone(c, "sine", base * r, t, tail / Math.sqrt(r), peak * a, { dest, wet: .8, attack: .01 }));
  hiss(c, t, tail * .6, peak * .18, 1800, 600, { dest, attack: .02, wet: .6 });
}

function tanggu(c: AudioContext, t: number, peak: number, dest: AudioNode = sfxBus) {
  tone(c, "sine", 130, t, .55, peak, { to: 48, dest, wet: .4, attack: .002 });
  hiss(c, t, .14, peak * .3, 1600, 220, { dest, attack: .02 });
}

function cymbal(c: AudioContext, t: number, peak: number, dur = 1.4, dest: AudioNode = sfxBus) {
  hiss(c, t, dur, peak, 9000, 5200, { dest, attack: .01, q: .5, type: "highpass", wet: .6 });
}

/** Silk fan swish: filtered noise sweep. */
function fan(c: AudioContext, t: number, dur: number, peak: number, up = true, dest: AudioNode = sfxBus) {
  hiss(c, t, dur, peak, up ? 350 : 4200, up ? 4200 : 350, { dest, attack: .55, q: 1.3, wet: .3 });
}

/** Pipa: crisp pluck with sharp transient and body resonance */
function pipa(c: AudioContext, f: number, t: number, peak: number, dest: AudioNode = musicBus) {
  tone(c, "triangle", f, t, .32, peak, { dest, wet: .45, attack: .002 });
  tone(c, "sawtooth", f * 2, t, .14, peak * .28, { dest, wet: .4, attack: .002 });
  hiss(c, t, .04, peak * .3, 5200, 2800, { dest, attack: .01 });
}

/** Daluo: large Chinese gong with falling pitch */
function daluo(c: AudioContext, t: number, peak = .14, dest: AudioNode = musicBus) {
  tone(c, "sine", 230, t, 3.8, peak, { to: 160, dest, wet: .75, attack: .008 });
  tone(c, "sine", 345, t, 2.6, peak * .4, { to: 240, dest, wet: .7, attack: .008 });
  hiss(c, t, 2.2, peak * .22, 2800, 900, { dest, attack: .01, wet: .6 });
}

/** Xiaoluo: small Chinese gong with rising pitch */
function xiaoluo(c: AudioContext, t: number, peak = .1, dest: AudioNode = musicBus) {
  tone(c, "sine", 580, t, 1.8, peak, { to: 690, dest, wet: .6, attack: .003 });
  tone(c, "sine", 870, t, 1.2, peak * .35, { to: 1040, dest, wet: .5, attack: .003 });
}

/** Xiao: deep meditative vertical bamboo flute */
function xiao(c: AudioContext, f: number, t: number, dur: number, peak: number, dest: AudioNode = musicBus) {
  dizi(c, f * .5, t, dur, peak * 1.05, dest);
}

/** Soft drone for the bed of a sting. */
function drone(c: AudioContext, t: number, dur: number, peak: number) {
  [[P[0] / 2, 0], [P[0] / 2, 7], [P[3] / 2, -5]].forEach(([f, det]) => {
    const o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = det;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420; lp.Q.value = .4;
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * .3); g.gain.setValueAtTime(peak, t + dur * .6);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(musicBus);
    track(o, [lp, g], true); o.start(t); o.stop(t + dur + .05);
  });
}

function glissando(c: AudioContext, t: number, notes: number[], gap: number, peak: number, dest: AudioNode) {
  notes.forEach((n, i) => zheng(c, P[n] || P[5], t + i * gap, peak * (.6 + .4 * i / notes.length), { dest }));
}

type StingFn = (c: AudioContext, t: number) => void;

/** Multi-variant, richly randomized 5–8 second traditional Chinese compositions. */
const STINGS: Record<StingKind, StingFn[]> = {
  home: [
    // 1. Dragon Gate Imperial Chimes (钟乐鸣天)
    (c, t) => {
      drone(c, t, 6.8, .045);
      gongHit(c, t, 98, .12, 4.5, musicBus);
      bell(c, P[5], t + .1, .1, 3.2, musicBus);
      glissando(c, t + .4, [0, 2, 3, 5, 7, 8, 10, 12, 13], .045, .19, musicBus);
      [[10, 1.1, .7], [12, 1.7, .5], [10, 2.2, .6], [8, 2.8, 1.2], [5, 4.0, 1.6]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .048));
      bell(c, P[10], t + 3.8, .07, 3.0, musicBus);
      zheng(c, P[5], t + 5.6, .14, { dest: musicBus, bend: 1.06 });
    },
    // 2. Jade Palace Horizon (紫禁流云)
    (c, t) => {
      drone(c, t, 6.5, .04);
      fan(c, t, .8, .08, true, musicBus);
      [[5, .2], [7, .5], [8, .8], [10, 1.2], [8, 1.6], [7, 2.0], [5, 2.5]].forEach(([n, s]) => zheng(c, P[n], t + s, .16, { dest: musicBus, bend: n === 8 ? 1.05 : undefined }));
      [[12, 2.2, .8], [10, 3.0, .6], [8, 3.6, 1.4]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .045));
      muyu(c, 780, t + 4.2, .09, musicBus);
      bell(c, P[8], t + 4.6, .08, 2.8, musicBus);
    },
    // 3. Azure Dragon Awakening (青龙破晓)
    (c, t) => {
      drone(c, t, 7.0, .045);
      daluo(c, t, .12, musicBus);
      tanggu(c, t + .2, .15, musicBus);
      glissando(c, t + .35, [3, 5, 7, 8, 10, 12, 13, 15], .04, .2, musicBus);
      [[13, 1.2, .6], [12, 1.7, .5], [10, 2.2, .8], [8, 3.0, .6], [10, 3.6, 1.8]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .05));
      tanggu(c, t + 2.8, .11, musicBus);
      bell(c, P[13], t + 4.5, .07, 2.5, musicBus);
    }
  ],

  explore: [
    // 1. Jianghu Gallop (江湖策马)
    (c, t) => {
      drone(c, t, 6.2, .04);
      [0, .3, .6, .9, 1.2, 1.5].forEach((s, i) => muyu(c, i % 2 === 0 ? 640 : 840, t + s, .11, musicBus));
      tanggu(c, t, .14, musicBus); tanggu(c, t + 1.2, .13, musicBus);
      [[5, 1.4], [7, 1.65], [8, 1.9], [10, 2.3], [8, 2.6], [7, 2.9], [5, 3.3]].forEach(([n, s]) => zheng(c, P[n], t + s, .17, { dest: musicBus }));
      pipa(c, P[10], t + 2.0, .14, musicBus); pipa(c, P[12], t + 2.4, .13, musicBus);
      dizi(c, P[12], t + 3.4, 1.5, .045);
    },
    // 2. Bamboo Forest Whispers (竹海听风)
    (c, t) => {
      drone(c, t, 6.0, .035);
      fan(c, t, .9, .07, false, musicBus);
      glissando(c, t + .3, [12, 10, 8, 7, 5, 3], .06, .15, musicBus);
      glissando(c, t + .9, [3, 5, 7, 8, 10], .05, .15, musicBus);
      [[8, 1.8, 1.1], [10, 2.8, .7], [8, 3.5, 1.4]].forEach(([n, s, d]) => xiao(c, P[n], t + s, d, .045));
      muyu(c, 750, t + 2.4, .1, musicBus); muyu(c, 820, t + 2.8, .08, musicBus);
      bell(c, P[7], t + 4.5, .06, 2.2, musicBus);
    },
    // 3. Four Realms Trail (四境踏歌)
    (c, t) => {
      drone(c, t, 6.5, .04);
      tanggu(c, t, .12, musicBus); xiaoluo(c, t + .4, .09, musicBus);
      [0, .35, .7, 1.05].forEach((s, i) => muyu(c, i === 2 ? 900 : 700, t + .8 + s, .1, musicBus));
      [[7, 1.8], [8, 2.1], [10, 2.4], [12, 2.85], [10, 3.2]].forEach(([n, s]) => zheng(c, P[n], t + s, .16, { dest: musicBus, bend: 1.05 }));
      [[13, 2.9, .6], [12, 3.5, 1.5]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .048));
      bell(c, P[10], t + 4.8, .07, 2.4, musicBus);
    }
  ],

  pass: [
    // 1. Imperial Jade Seal (御令通行)
    (c, t) => {
      drone(c, t, 6.5, .04);
      gongHit(c, t, 85, .11, 4.5, musicBus);
      bell(c, P[5], t + .1, .1, 3.2, musicBus);
      bell(c, P[8], t + .9, .08, 3.0, musicBus);
      [[8, 1.6], [10, 1.9], [12, 2.3], [13, 2.8]].forEach(([n, s]) => zheng(c, P[n], t + s, .16, { dest: musicBus, bend: 1.06 }));
      dizi(c, P[12], t + 3.1, 1.3, .045);
      dizi(c, P[10], t + 4.3, 1.8, .04);
    },
    // 2. Ink Scroll Inscription (关塞墨韵)
    (c, t) => {
      drone(c, t, 6.0, .038);
      fan(c, t, .7, .09, true, musicBus);
      [[3, .3], [5, .6], [7, .9], [8, 1.3], [10, 1.7]].forEach(([n, s]) => zheng(c, P[n], t + s, .15, { dest: musicBus }));
      pipa(c, P[12], t + 1.8, .13, musicBus); pipa(c, P[10], t + 2.1, .12, musicBus);
      [[10, 2.4, .9], [8, 3.3, 1.6]].forEach(([n, s, d]) => xiao(c, P[n], t + s, d, .042));
      muyu(c, 760, t + 3.8, .09, musicBus);
      bell(c, P[10], t + 4.6, .06, 2.2, musicBus);
    },
    // 3. Traveler's Blessing (塞外清平)
    (c, t) => {
      drone(c, t, 6.2, .04);
      bell(c, P[7], t, .08, 3.0, musicBus);
      glissando(c, t + .4, [5, 7, 8, 10, 12], .06, .17, musicBus);
      [[12, 1.4, .6], [10, 2.0, .5], [8, 2.5, .7], [10, 3.2, 1.6]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .045));
      zheng(c, P[7], t + 4.2, .13, { dest: musicBus, bend: 1.05 });
      bell(c, P[12], t + 4.8, .06, 2.2, musicBus);
    }
  ],

  reward: [
    // 1. Golden Fortune Celebration (金玉满堂)
    (c, t) => {
      drone(c, t, 6.2, .045);
      cymbal(c, t, .07, 1.6, musicBus);
      tanggu(c, t, .16, musicBus); tanggu(c, t + .4, .13, musicBus);
      glissando(c, t + .2, [5, 7, 8, 10, 12, 13, 15], .045, .19, musicBus);
      bell(c, P[10], t + 1.1, .09, 3, musicBus);
      xiaoluo(c, t + 1.4, .09, musicBus);
      [[15, 1.8, .4], [13, 2.2, .5], [12, 2.7, .6], [10, 3.3, 1.5]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .045));
      bell(c, P[15], t + 4.2, .06, 2.4, musicBus);
    },
    // 2. Dragon Pearl Glow (神珠流光)
    (c, t) => {
      drone(c, t, 6.0, .04);
      bell(c, P[10], t, .09, 2.8, musicBus);
      bell(c, P[13], t + .35, .08, 2.6, musicBus);
      bell(c, P[15], t + .7, .06, 2.4, musicBus);
      [[10, 1.2], [12, 1.5], [13, 1.8], [15, 2.2], [13, 2.6]].forEach(([n, s]) => zheng(c, P[n], t + s, .16, { dest: musicBus }));
      pipa(c, P[15], t + 2.3, .13, musicBus); pipa(c, P[15], t + 2.5, .12, musicBus);
      dizi(c, P[13], t + 2.9, 1.4, .045);
      gongHit(c, t + 3.8, 110, .08, 3.0, musicBus);
    },
    // 3. Vault of Celestial Wonders (天宝开函)
    (c, t) => {
      drone(c, t, 6.4, .045);
      daluo(c, t, .13, musicBus);
      tanggu(c, t + .15, .14, musicBus);
      glissando(c, t + .3, [0, 3, 5, 8, 10, 12, 13], .05, .18, musicBus);
      [[13, 1.2, .5], [15, 1.7, .5], [13, 2.2, .7], [12, 2.9, .6], [10, 3.5, 1.6]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .05));
      bell(c, P[12], t + 4.2, .07, 2.5, musicBus);
    }
  ],

  story: [
    // 1. Ancient Chronicle (千古传奇)
    (c, t) => {
      drone(c, t, 7.8, .05);
      gongHit(c, t, 82, .14, 5, musicBus);
      [[3, 1.2, 1.2], [5, 2.4, .7], [7, 3.1, .7], [5, 3.8, 1.8]].forEach(([n, s, d]) => xiao(c, P[n], t + s, d, .05));
      [[0, 1.2], [3, 2.4], [5, 3.8], [8, 5.4]].forEach(([n, s]) => zheng(c, P[n], t + s, .13, { dest: musicBus, bend: 1.05 }));
      bell(c, P[5], t + 5.8, .07, 3.0, musicBus);
    },
    // 2. Moonlight over Jianghu (江月孤影)
    (c, t) => {
      drone(c, t, 7.5, .045);
      fan(c, t, 1.1, .07, true, musicBus);
      bell(c, P[3], t + .4, .08, 3.5, musicBus);
      [[5, 1.5], [8, 2.1], [10, 2.8], [8, 3.4], [7, 4.0], [5, 4.7]].forEach(([n, s]) => zheng(c, P[n], t + s, .15, { dest: musicBus, bend: 1.06 }));
      [[10, 2.9, 1.1], [8, 4.1, 1.6]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .042));
      muyu(c, 620, t + 5.2, .08, musicBus);
    },
    // 3. Oracle of the Four Spirits (四象神谕)
    (c, t) => {
      drone(c, t, 7.5, .05);
      daluo(c, t, .12, musicBus);
      bell(c, P[5], t + .3, .09, 3.2, musicBus);
      bell(c, P[8], t + .8, .07, 3.0, musicBus);
      glissando(c, t + 1.2, [2, 3, 5, 7, 8, 10], .07, .14, musicBus);
      [[7, 2.4, 1.0], [8, 3.4, .8], [5, 4.2, 2.0]].forEach(([n, s, d]) => xiao(c, P[n], t + s, d, .048));
      zheng(c, P[5], t + 5.8, .14, { dest: musicBus, bend: 1.05 });
    }
  ],

  info: [
    // 1. Clear Spring Droplets (石上清泉)
    (c, t) => {
      drone(c, t, 5.2, .035);
      glissando(c, t + .1, [13, 12, 10, 8, 7, 5], .05, .16, musicBus);
      bell(c, P[10], t + 1.2, .07, 2.5, musicBus);
      [[10, 1.5, .7], [8, 2.2, 1.2]].forEach(([n, s, d]) => dizi(c, P[n], t + s, d, .04));
      muyu(c, 840, t + 3.2, .08, musicBus);
    },
    // 2. Pine Breeze Pavilion (松风弦语)
    (c, t) => {
      drone(c, t, 5.0, .035);
      fan(c, t, .8, .07, false, musicBus);
      [[8, .3], [7, .65], [5, 1.0], [3, 1.5]].forEach(([n, s]) => zheng(c, P[n], t + s, .15, { dest: musicBus, bend: 1.05 }));
      pipa(c, P[10], t + 1.8, .12, musicBus);
      dizi(c, P[8], t + 2.2, 1.3, .04);
      bell(c, P[8], t + 3.6, .06, 2.0, musicBus);
    },
    // 3. Evening Temple Bell (晚钟听禅)
    (c, t) => {
      drone(c, t, 5.5, .038);
      bell(c, P[5], t, .09, 3.2, musicBus);
      bell(c, P[10], t + .6, .06, 2.5, musicBus);
      zheng(c, P[5], t + 1.4, .15, { dest: musicBus, bend: 1.07 });
      [[8, 2.1, 1.0], [5, 3.2, 1.5]].forEach(([n, s, d]) => xiao(c, P[n], t + s, d, .04));
      muyu(c, 700, t + 4.0, .08, musicBus);
    }
  ]
};

const lastVariant = new Map<StingKind, number>();

function canMusic() {
  return musicAllowed && !document.body.classList.contains("staff-mode");
}

export const sfx = {
  unlock() {
    unlocked = true; const c = ensure(); if (!c || !enabled) return;
    void c.resume().catch(() => {});
  },
  isEnabled: () => enabled,
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  setEnabled(next: boolean) {
    enabled = next;
    try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* private mode */ }
    const c = ctx;
    if (c) {
      master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(next ? .85 : 0, c.currentTime, .06);
      if (next && unlocked) void c.resume().catch(() => {}); else sfx.stopMusic(false);
    }
    listeners.forEach(fn => fn());
  },
  /** Music stings are only for the participant experience. */
  setMusicAllowed(allowed: boolean) { musicAllowed = allowed; if (!allowed) sfx.stopMusic(true); },
  vibrate(pattern: number | number[]) { if (enabled) try { navigator.vibrate?.(pattern); } catch { /* unsupported */ } },

  /** Short page-change cue (5–8 s). Randomly selects an authentic Chinese variation. */
  sting(kind: StingKind = "info") {
    const c = live(); if (!c || !canMusic()) return;
    if (c.currentTime - lastSting < 3.5) return;
    lastSting = c.currentTime;
    sfx.stopMusic(true);
    musicBus.gain.cancelScheduledValues(c.currentTime);
    musicBus.gain.setValueAtTime(.55, c.currentTime + .3);
    const variants = STINGS[kind] || STINGS.info;
    const last = lastVariant.get(kind) ?? -1;
    let next = Math.floor(Math.random() * variants.length);
    if (variants.length > 1 && next === last) {
      next = (next + 1 + Math.floor(Math.random() * (variants.length - 1))) % variants.length;
    }
    lastVariant.set(kind, next);
    variants[next](c, c.currentTime + .32);
  },
  stopMusic(fade = true) {
    if (!ctx) return;
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now); musicBus.gain.setTargetAtTime(0, now, fade ? .1 : .015);
    musicVoices.forEach(s => { try { s.stop(now + (fade ? .3 : .03)); } catch { /* ended */ } });
    musicVoices.clear();
  },
  /** @deprecated continuous BGM was removed; kept so old callers stay safe. */
  startBgm() { /* no-op */ },
  stopBgm(fade = true) { sfx.stopMusic(fade); },

  // ---- UI SFX (rotating variants so repeated taps never sound identical) ----
  tap() {
    const c = live(); if (!c || c.currentTime - lastTap < .06) return;
    lastTap = c.currentTime;
    const pitches = [880, 990, 784, 1046];
    muyu(c, pitches[tapIndex++ % pitches.length] * (.97 + Math.random() * .06), c.currentTime, .16);
  },
  hover() { const c = live(); if (c) muyu(c, 1320, c.currentTime, .03); },
  select(variant = 0) {
    const c = live(); if (!c) return; const v = Math.abs(variant) % 4;
    const pairs = [[5, 8], [6, 9], [8, 10], [9, 12]][v];
    zheng(c, P[pairs[0]], c.currentTime, .28, { bend: 1.06 });
    zheng(c, P[pairs[1]], c.currentTime + .085, .17);
  },
  page() {
    const c = live(); if (!c) return;
    fan(c, c.currentTime, .32, .07);
    bell(c, P[[10, 11, 12][Math.floor(Math.random() * 3)]], c.currentTime + .08, .045, 1.2);
  },
  brush(intensity = 1) {
    const c = live(); if (!c) return;
    hiss(c, c.currentTime, .45, .07 * intensity, 600, 2600, { attack: .2, q: 2.2, wet: .2 });
    hiss(c, c.currentTime + .12, .3, .03 * intensity, 4200, 1500, { attack: .3, q: 1.5 });
  },
  whoosh(duration = .7, intensity = 1) {
    const c = live(); if (!c) return;
    fan(c, c.currentTime, duration, .12 * intensity);
    fan(c, c.currentTime + duration * .35, duration * .65, .05 * intensity, false);
  },
  rise(duration = 1.8) {
    const c = live(); if (!c) return;
    hiss(c, c.currentTime, duration, .11, 220, 6800, { attack: .9, wet: .5 });
    cymbal(c, c.currentTime + duration * .3, .03, duration * .8);
    [0, 2, 3, 5, 6, 8, 9, 10, 12, 13].forEach((n, i) => zheng(c, P[n], c.currentTime + duration * i / 11, .07 + i * .012));
  },
  impact(strength = 1) {
    const c = live(); if (!c) return;
    tanggu(c, c.currentTime, .4 * strength); gongHit(c, c.currentTime, 98, .17 * strength, 3.2);
    cymbal(c, c.currentTime, .05 * strength, 1.2);
    sfx.vibrate([30, 20, 50]);
  },
  gong() { const c = live(); if (c) gongHit(c, c.currentTime, 110, .2, 3.4); },
  stamp() {
    const c = live(); if (c) { tanggu(c, c.currentTime, .32); muyu(c, 520, c.currentTime + .01, .2); bell(c, P[8], c.currentTime + .06, .06, 1.5); }
    sfx.vibrate([40, 30, 25]);
  },
  chime() { const c = live(); if (c) [8, 10, 12].forEach((n, i) => bell(c, P[n], c.currentTime + i * .09, .05, 1.4)); },
  success() {
    sfx.stamp(); const c = live();
    if (c) [5, 8, 10, 13].forEach((n, i) => zheng(c, P[n], c.currentTime + .15 + i * .11, .22));
  },
  error() {
    const c = live(); if (c) { zheng(c, P[4], c.currentTime, .26, { bend: .94 }); muyu(c, 440, c.currentTime + .16, .16); }
    sfx.vibrate([60, 40, 60]);
  },
  fanfare() {
    sfx.impact(.8); const c = live();
    if (c) { [5, 8, 9, 10, 13].forEach((n, i) => zheng(c, P[n], c.currentTime + .18 + i * .09, .28)); bell(c, P[13], c.currentTime + .7, .05, 2.4); }
  },
};

// Editing sound design must not leave the previous module's voices playing.
if (import.meta.hot) import.meta.hot.dispose(() => {
  sfx.stopMusic(false);
  if (visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler);
  void ctx?.close().catch(() => {});
});
