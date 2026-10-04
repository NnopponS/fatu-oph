import { useId, type CSSProperties } from "react";

const runes = ["乾", "坤", "震", "巽", "坎", "離", "艮", "兌"];

export function CelestialArray({ className = "", color = "#e8c982" }: { className?: string; color?: string }) {
  const gradient = `array-${useId().replace(/:/g, "")}`;
  return <div className={`celestial-array ${className}`} style={{ "--array-color": color } as CSSProperties} aria-hidden="true">
    <svg className="array-outer" viewBox="0 0 400 400" fill="none">
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="400" y2="400"><stop stopColor="#fff0bc" /><stop offset=".45" stopColor={color} /><stop offset="1" stopColor="#97d5c1" /></linearGradient></defs>
      <g stroke={`url(#${gradient})`}><circle cx="200" cy="200" r="190" /><circle cx="200" cy="200" r="181" strokeDasharray="1 9" strokeWidth="3" /><circle cx="200" cy="200" r="143" /><circle cx="200" cy="200" r="139" strokeOpacity=".45" />
        {[0, 1, 2, 3].map(index => <path key={index} d="M185 10h30m-8-5v11m-14-11v11" transform={`rotate(${index * 90} 200 200)`} strokeWidth="2" />)}
      </g>
      {runes.map((rune, index) => {
        const angle = index * Math.PI / 4 - Math.PI / 2;
        return <text key={rune} x={200 + Math.cos(angle) * 163} y={207 + Math.sin(angle) * 163} textAnchor="middle" fill={color} fontSize="20" fontFamily="serif" transform={`rotate(${index * 45} ${200 + Math.cos(angle) * 163} ${207 + Math.sin(angle) * 163})`}>{rune}</text>;
      })}
    </svg>
    <svg className="array-inner" viewBox="0 0 400 400" fill="none" stroke={color}>
      <path d="m200 58 100 42 42 100-42 100-100 42-100-42-42-100 42-100Z" strokeOpacity=".6" />
      <path d="m200 80 120 120-120 120L80 200Zm-85 35h170v170H115Z" strokeOpacity=".3" />
      <circle cx="200" cy="200" r="105" strokeDasharray="45 12" /><circle cx="200" cy="200" r="97" strokeOpacity=".25" />
      {[0, 1, 2, 3].map(index => <path key={index} d="m200 68 5 7-5 7-5-7Z" fill={color} transform={`rotate(${index * 90} 200 200)`} />)}
    </svg>
    <span className="array-halo" /><span className="array-wave first" /><span className="array-wave second" />
  </div>;
}
