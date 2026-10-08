import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfx } from "@/lib/sfx";

function useSoundEnabled() {
  return useSyncExternalStore(sfx.subscribe, sfx.isEnabled, () => true);
}

export function SoundToggle() {
  const on = useSoundEnabled();
  return <button type="button" className={`sound-toggle ${on ? "on" : ""}`} aria-pressed={on} aria-label={on ? "ปิดเสียงดนตรีและเอฟเฟกต์" : "เปิดเสียงดนตรีและเอฟเฟกต์"} onClick={() => { sfx.unlock(); sfx.setEnabled(!on); }}>
    {on ? <Volume2 size={17} /> : <VolumeX size={17} />}
    {on && <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span>}
  </button>;
}
