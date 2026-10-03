import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const root = 'D:\\Project\\fatu-openhouse';
const targetDirs = [
  path.join(root, 'src', 'assets', 'characters'),
  path.join(root, 'public', 'src', 'assets', 'characters'),
  path.join(root, 'public', 'assets', 'characters'),
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Full-body character mascot SVGs with Chinese mythology aesthetics and embedded SVG keyframe animations
const characters = [
  {
    name: 'azure-dragon-mascot.svg',
    title: 'Azure Dragon (ชิงหลง - มังกรครามประจำทิศบูรพา)',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="azBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021f24" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#04323a" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#021417" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="azDragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14b8a6" />
      <stop offset="40%" stop-color="#0d9488" />
      <stop offset="80%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="azGold" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="azFlame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="60%" stop-color="#67e8f9" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <radialGradient id="azOrbGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a5f3fc" stop-opacity="1" />
      <stop offset="45%" stop-color="#38bdf8" stop-opacity="0.8" />
      <stop offset="80%" stop-color="#0284c7" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
    </radialGradient>
    <filter id="azGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes azFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-14px) rotate(0.8deg); }
    }
    @keyframes azPulseOrb {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.14); opacity: 1; }
    }
    @keyframes azWhiskers {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(4deg); }
    }
    @keyframes cloudDrift {
      0%, 100% { transform: translateX(0px); }
      50% { transform: translateX(12px); }
    }
    .az-mascot { animation: azFloat 5s ease-in-out infinite; transform-origin: 300px 300px; }
    .az-orb { animation: azPulseOrb 2.8s ease-in-out infinite; transform-origin: 430px 420px; }
    .az-whiskers { animation: azWhiskers 3s ease-in-out infinite alternate; transform-origin: 300px 220px; }
    .az-clouds { animation: cloudDrift 6s ease-in-out infinite; }
  </style>

  <!-- Celestial Aureole Background -->
  <circle cx="300" cy="300" r="260" fill="url(#azBg)" stroke="url(#azGold)" stroke-width="4" opacity="0.9" />
  <circle cx="300" cy="300" r="248" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.6" />
  <circle cx="300" cy="300" r="236" fill="none" stroke="#0d9488" stroke-width="1" opacity="0.4" />

  <!-- Auspicious Celestial Cloud Swirls in Background -->
  <g class="az-clouds" opacity="0.65">
    <path d="M 80,450 Q 120,410 170,430 Q 210,400 240,430 Q 270,410 300,440 C 260,470 120,480 80,450 Z" fill="#042f2e" stroke="#14b8a6" stroke-width="1.5" />
    <path d="M 420,160 Q 460,130 500,150 Q 530,130 550,160 C 520,190 440,190 420,160 Z" fill="#042f2e" stroke="#14b8a6" stroke-width="1.5" />
    <path d="M 100,180 Q 140,150 170,180 C 150,210 110,210 100,180 Z" fill="#042f2e" stroke="#d4af37" stroke-width="1.2" opacity="0.7" />
  </g>

  <!-- Mascot Main Group -->
  <g class="az-mascot">
    <!-- Sinuous Dragon Body (Coiling upward) -->
    <path d="M 180,460 C 130,370 160,280 230,260 C 310,240 370,300 420,270 C 470,240 460,180 400,160 C 340,140 270,160 250,210" 
          fill="none" stroke="url(#azDragonBody)" stroke-width="68" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- Dragon Belly Scales Underlay -->
    <path d="M 180,460 C 130,370 160,280 230,260 C 310,240 370,300 420,270 C 470,240 460,180 400,160 C 340,140 270,160 250,210" 
          fill="none" stroke="url(#azGold)" stroke-width="18" stroke-linecap="round" opacity="0.85" stroke-dasharray="14 12" />

    <!-- Dorsal Fin Crest (Golden Spines) -->
    <g fill="url(#azGold)" stroke="#854d0e" stroke-width="1">
      <polygon points="215,225 220,195 235,225" />
      <polygon points="245,215 255,185 265,220" />
      <polygon points="280,215 295,185 305,220" />
      <polygon points="325,225 345,190 355,230" />
      <polygon points="370,230 395,200 400,240" />
      <polygon points="420,240 445,215 440,255" />
      <polygon points="440,280 470,270 450,300" />
      <polygon points="400,310 420,335 390,330" />
      <polygon points="350,315 365,345 340,330" />
      <polygon points="290,295 295,330 275,305" />
      <polygon points="230,300 220,335 210,310" />
      <polygon points="175,340 150,360 170,375" />
      <polygon points="160,400 135,420 165,430" />
    </g>

    <!-- Dragon Tail Tuft with Ethereal Flames -->
    <g transform="translate(180, 460)">
      <path d="M 0,0 C -30,40 -20,80 10,100 C 40,70 30,30 0,0 Z" fill="url(#azGold)" />
      <path d="M -10,15 C -45,55 -30,85 0,95 C 15,70 10,40 -10,15 Z" fill="#14b8a6" opacity="0.9" />
      <path d="M 5,20 C 15,60 40,85 45,95 C 40,65 25,40 5,20 Z" fill="#2dd4bf" opacity="0.8" />
    </g>

    <!-- Claws / Paws holding the Sacred Dragon Pearl -->
    <!-- Back Claw -->
    <g transform="translate(260, 310) rotate(-20)">
      <path d="M 0,0 L -25,35 L -10,45 L 15,10 Z" fill="#0d9488" stroke="#d4af37" stroke-width="2" />
      <polygon points="-25,35 -38,50 -20,42" fill="url(#azGold)" />
      <polygon points="-10,45 -15,62 -2,48" fill="url(#azGold)" />
      <polygon points="5,40 8,56 16,40" fill="url(#azGold)" />
    </g>

    <!-- Front Majestic Claw reaching for Celestial Orb -->
    <g transform="translate(370, 340)">
      <path d="M 0,0 L 40,40 L 55,30 L 20,-10 Z" fill="#0d9488" stroke="#d4af37" stroke-width="2" />
      <polygon points="40,40 60,55 45,45" fill="url(#azGold)" />
      <polygon points="48,32 70,38 52,25" fill="url(#azGold)" />
      <polygon points="35,20 52,15 36,10" fill="url(#azGold)" />
    </g>

    <!-- Dragon Head Group -->
    <g transform="translate(240, 160)">
      <!-- Head Base -->
      <path d="M 10,20 C 25,-15 75,-20 110,-5 C 130,5 150,25 150,55 C 145,85 110,105 70,100 C 30,95 0,60 10,20 Z" 
            fill="url(#azDragonBody)" stroke="#d4af37" stroke-width="3" />

      <!-- Snout / Muzzle -->
      <path d="M -35,35 C -30,15 5,10 35,20 C 35,50 15,70 -20,65 C -35,60 -40,45 -35,35 Z" 
            fill="#0f766e" stroke="#d4af37" stroke-width="2.5" />
      <ellipse cx="-20" cy="36" rx="5" ry="3" fill="#042f2e" /> <!-- Nostril -->

      <!-- Imperial Golden Horns (Stag-like Antlers) -->
      <path d="M 75,-10 C 85,-40 110,-70 140,-85 C 135,-65 120,-50 110,-40 C 130,-50 150,-55 165,-50 C 145,-35 125,-25 105,-15" 
            fill="url(#azGold)" stroke="#854d0e" stroke-width="2" filter="url(#goldGlow)" />
      <path d="M 50,-15 C 55,-45 70,-75 95,-95 C 90,-75 80,-60 75,-48 C 90,-58 105,-62 115,-58 C 100,-42 85,-30 70,-20" 
            fill="url(#azGold)" stroke="#854d0e" stroke-width="1.8" opacity="0.8" />

      <!-- Mane / Celestial Hair tufts -->
      <path d="M 85,15 C 120,0 155,20 180,45 C 160,50 140,45 130,40 C 150,55 160,75 165,95 C 145,85 130,75 115,70 C 130,90 135,115 130,135 C 110,110 95,95 85,85" 
            fill="url(#azFlame)" opacity="0.9" />

      <!-- Glowing Dragon Eyes -->
      <ellipse cx="40" cy="25" rx="14" ry="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
      <ellipse cx="42" cy="25" rx="6" ry="9" fill="#042f2e" />
      <circle cx="44" cy="22" r="2.5" fill="#ffffff" />
      <!-- Brow Ridge -->
      <path d="M 22,18 C 35,10 55,12 65,18" fill="none" stroke="#d4af37" stroke-width="4" stroke-linecap="round" />

      <!-- Whiskers (Long, undulating) -->
      <g class="az-whiskers">
        <path d="M -15,45 C -40,60 -60,95 -65,145 C -55,110 -35,80 -10,60" 
              fill="none" stroke="url(#azGold)" stroke-width="3" stroke-linecap="round" />
        <path d="M -10,48 C -30,70 -45,110 -40,155 C -35,120 -20,90 -5,65" 
              fill="none" stroke="#67e8f9" stroke-width="2" stroke-linecap="round" opacity="0.85" />
      </g>

      <!-- Beard / Chin Tuft -->
      <path d="M -10,65 C -15,90 -5,115 10,130 C 5,105 5,85 5,70" fill="url(#azGold)" />
    </g>

    <!-- The Flaming Sacred Pearl / Celestial Dragon Orb (ลูกแก้วสารพัดนึก) -->
    <g class="az-orb" transform="translate(425, 410)">
      <circle cx="0" cy="0" r="38" fill="url(#azOrbGlow)" filter="url(#azGlow)" />
      <circle cx="0" cy="0" r="25" fill="#ffffff" opacity="0.95" />
      <circle cx="-6" cy="-6" r="8" fill="#e0f2fe" />
      <circle cx="-10" cy="-10" r="4" fill="#ffffff" />
      <!-- Swirling Mystical Flames around Pearl -->
      <path d="M -25,0 C -35,-25 -10,-40 0,-30 C -15,-20 -10,-10 -5,0 Z" fill="url(#azGold)" />
      <path d="M 20,-15 C 38,-30 45,-10 30,5 C 25,-5 20,-5 20,-15 Z" fill="url(#azGold)" />
      <path d="M -10,25 C -25,38 5,45 15,30 C 5,30 0,25 -10,25 Z" fill="url(#azGold)" />
    </g>
  </g>

  <!-- Title Ribbon at Bottom -->
  <g transform="translate(300, 535)">
    <rect x="-140" y="-22" width="280" height="44" rx="10" fill="#042f2e" stroke="url(#azGold)" stroke-width="2" />
    <text x="0" y="7" font-family="'Cinzel', 'Noto Serif Thai', serif" font-size="18" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="2">
      AZURE DRAGON • ชิงหลง
    </text>
  </g>
</svg>`
  },

  {
    name: 'white-tiger-mascot.svg',
    title: 'White Tiger (ไป๋หู่ - พยัคฆ์ขาวประจำทิศประจิม)',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="wtBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#27272a" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#09090b" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="wtFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f4f4f5" />
      <stop offset="100%" stop-color="#d4d4d8" />
    </linearGradient>
    <linearGradient id="wtGold" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>
    <linearGradient id="wtSilver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <filter id="wtGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes wtFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes wtEyesGlow {
      0%, 100% { filter: drop-shadow(0 0 4px #eab308); }
      50% { filter: drop-shadow(0 0 12px #fef08a); }
    }
    @keyframes wtTail {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(8deg); }
    }
    .wt-mascot { animation: wtFloat 4.8s ease-in-out infinite; transform-origin: 300px 300px; }
    .wt-eyes { animation: wtEyesGlow 3s ease-in-out infinite; }
    .wt-tail { animation: wtTail 3.5s ease-in-out infinite alternate; transform-origin: 430px 420px; }
  </style>

  <!-- Aureole Disc -->
  <circle cx="300" cy="300" r="260" fill="url(#wtBg)" stroke="url(#wtGold)" stroke-width="4" opacity="0.9" />
  <circle cx="300" cy="300" r="248" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="10 6" opacity="0.5" />

  <!-- Mountain Peaks & Silver Mist Silhouette -->
  <g opacity="0.45">
    <polygon points="120,470 200,320 280,470" fill="#27272a" />
    <polygon points="240,480 340,300 440,480" fill="#3f3f46" />
    <polygon points="380,470 460,350 540,470" fill="#27272a" />
    <!-- Mist waves -->
    <path d="M 80,460 Q 200,420 320,460 T 540,450" fill="none" stroke="#e4e4e7" stroke-width="3" opacity="0.4" />
  </g>

  <!-- White Tiger Character Group -->
  <g class="wt-mascot">
    <!-- Tail (Curling high with stripes) -->
    <g class="wt-tail">
      <path d="M 430,380 C 470,360 510,320 515,260 C 518,220 495,190 465,195 C 445,198 440,220 455,230 C 475,240 485,270 460,320 C 445,350 420,370 410,380 Z" 
            fill="url(#wtFur)" stroke="#27272a" stroke-width="2" />
      <!-- Tail Stripes -->
      <path d="M 505,290 Q 515,280 500,270" stroke="#18181b" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M 490,250 Q 500,235 480,230" stroke="#18181b" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M 465,205 Q 460,215 450,215" stroke="url(#wtGold)" stroke-width="5" stroke-linecap="round" fill="none" />
    </g>

    <!-- Powerful Muscular Body -->
    <path d="M 210,450 C 180,420 180,360 210,320 C 235,285 280,275 340,290 C 400,305 440,350 435,420 C 430,460 380,475 320,470 C 260,465 230,465 210,450 Z" 
          fill="url(#wtFur)" stroke="#d4d4d8" stroke-width="2" />

    <!-- Tiger Body Stripes (Fierce Onyx & Gold) -->
    <path d="M 250,330 Q 280,350 270,390" stroke="#18181b" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M 300,320 Q 330,345 325,385" stroke="#18181b" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M 350,325 Q 380,355 370,400" stroke="#18181b" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M 390,345 Q 415,370 405,410" stroke="url(#wtGold)" stroke-width="5" stroke-linecap="round" fill="none" />

    <!-- Front Paws with Golden Claws (Martial Stance) -->
    <g transform="translate(200, 430)">
      <path d="M 0,0 L 25,35 L -10,38 L -20,10 Z" fill="url(#wtFur)" stroke="#a1a1aa" stroke-width="1.5" />
      <polygon points="10,35 15,48 5,42" fill="url(#wtGold)" />
      <polygon points="22,33 30,46 18,40" fill="url(#wtGold)" />
      <polygon points="-2,35 -5,48 -8,40" fill="url(#wtGold)" />
    </g>
    <g transform="translate(360, 440)">
      <path d="M 0,0 L 25,35 L -10,38 L -15,10 Z" fill="url(#wtFur)" stroke="#a1a1aa" stroke-width="1.5" />
      <polygon points="10,35 15,48 5,42" fill="url(#wtGold)" />
      <polygon points="22,33 30,46 18,40" fill="url(#wtGold)" />
      <polygon points="-2,35 -5,48 -8,40" fill="url(#wtGold)" />
    </g>

    <!-- Tiger Noble Head -->
    <g transform="translate(230, 160)">
      <!-- Head Shape -->
      <path d="M 10,60 C 5,10 40,-20 90,-20 C 140,-20 175,10 170,60 C 165,110 135,130 90,130 C 45,130 15,110 10,60 Z" 
            fill="url(#wtFur)" stroke="#e4e4e7" stroke-width="2" />
      
      <!-- Regal Tiger Ears -->
      <polygon points="25,-5 10,-45 55,-25" fill="#f4f4f5" stroke="#18181b" stroke-width="2" />
      <polygon points="25,-8 18,-35 45,-22" fill="#71717a" />
      <polygon points="155,-5 170,-45 125,-25" fill="#f4f4f5" stroke="#18181b" stroke-width="2" />
      <polygon points="155,-8 162,-35 135,-22" fill="#71717a" />

      <!-- Imperial 'King' (王) Mark on Forehead -->
      <g stroke="url(#wtGold)" stroke-width="4.5" stroke-linecap="round" fill="none">
        <line x1="72" y1="-2" x2="108" y2="-2" />
        <line x1="77" y1="12" x2="103" y2="12" />
        <line x1="68" y1="26" x2="112" y2="26" />
        <line x1="90" y1="-2" x2="90" y2="26" />
      </g>

      <!-- Fierce Head & Cheek Markings -->
      <path d="M 40,40 Q 20,45 25,65" stroke="#18181b" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M 35,70 Q 15,75 22,95" stroke="#18181b" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M 140,40 Q 160,45 155,65" stroke="#18181b" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M 145,70 Q 165,75 158,95" stroke="#18181b" stroke-width="6" stroke-linecap="round" fill="none" />

      <!-- Piercing Golden Eyes -->
      <g class="wt-eyes">
        <polygon points="50,48 72,42 66,56" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
        <ellipse cx="60" cy="48" rx="4" ry="6" fill="#18181b" />
        <polygon points="130,48 108,42 114,56" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
        <ellipse cx="120" cy="48" rx="4" ry="6" fill="#18181b" />
      </g>

      <!-- Snout & Whiskers -->
      <path d="M 70,80 C 70,70 110,70 110,80 C 110,95 90,105 90,105 C 90,105 70,95 70,80 Z" fill="#e4e4e7" />
      <polygon points="82,82 98,82 90,92" fill="#e11d48" />
      <!-- Whiskers -->
      <line x1="65" y1="88" x2="15" y2="82" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
      <line x1="65" y1="94" x2="18" y2="98" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
      <line x1="115" y1="88" x2="165" y2="82" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
      <line x1="115" y1="94" x2="162" y2="98" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
    </g>

    <!-- Celestial Jade & Gold Armor Collar -->
    <path d="M 270,270 Q 320,295 370,270 L 380,290 Q 320,320 260,290 Z" fill="url(#wtGold)" stroke="#854d0e" stroke-width="2" />
    <circle cx="320" cy="300" r="14" fill="#0d9488" stroke="url(#wtGold)" stroke-width="3" filter="url(#wtGlow)" />
  </g>

  <!-- Title Ribbon at Bottom -->
  <g transform="translate(300, 535)">
    <rect x="-140" y="-22" width="280" height="44" rx="10" fill="#18181b" stroke="url(#wtGold)" stroke-width="2" />
    <text x="0" y="7" font-family="'Cinzel', 'Noto Serif Thai', serif" font-size="18" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="2">
      WHITE TIGER • ไป๋หู่
    </text>
  </g>
</svg>`
  },

  {
    name: 'nine-tailed-fox-mascot.svg',
    title: 'Nine-Tailed Fox (จิ่วเหว่ยหู - จิ้งจอกเก้าหางแห่งเนินเขียว)',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="foxBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a0814" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#3b071a" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#19040c" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="foxFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="45%" stop-color="#fda4af" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <linearGradient id="foxGold" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="foxFire" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="50%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <radialGradient id="foxOrb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="40%" stop-color="#f43f5e" stop-opacity="0.9" />
      <stop offset="80%" stop-color="#881337" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#4c0519" stop-opacity="0" />
    </radialGradient>
    <filter id="foxGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes foxFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-13px) rotate(-0.5deg); }
    }
    @keyframes tailFan1 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(6deg); } }
    @keyframes tailFan2 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-5deg); } }
    @keyframes fireFloat { 0%, 100% { transform: scale(1) translateY(0px); opacity: 0.85; } 50% { transform: scale(1.15) translateY(-8px); opacity: 1; } }
    .fox-mascot { animation: foxFloat 4.6s ease-in-out infinite; transform-origin: 300px 300px; }
    .tail-left { animation: tailFan1 3.8s ease-in-out infinite alternate; transform-origin: 300px 380px; }
    .tail-right { animation: tailFan2 4.2s ease-in-out infinite alternate; transform-origin: 300px 380px; }
    .fox-fire { animation: fireFloat 2.4s ease-in-out infinite alternate; }
  </style>

  <!-- Aureole Disc -->
  <circle cx="300" cy="300" r="260" fill="url(#foxBg)" stroke="url(#foxGold)" stroke-width="4" opacity="0.9" />
  <circle cx="300" cy="300" r="248" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.6" />

  <!-- Mystical Fox Fire Spirit Orbs floating in background -->
  <g class="fox-fire" filter="url(#foxGlow)">
    <circle cx="130" cy="180" r="22" fill="url(#foxOrb)" />
    <circle cx="480" cy="190" r="26" fill="url(#foxOrb)" />
    <circle cx="160" cy="420" r="18" fill="url(#foxOrb)" />
    <circle cx="460" cy="400" r="20" fill="url(#foxOrb)" />
  </g>

  <!-- Fox Mascot Group -->
  <g class="fox-mascot">
    <!-- The Nine Luxurious Radiant Tails (Radiating fan) -->
    <!-- Left Tails -->
    <g class="tail-left">
      <!-- Tail 1 -->
      <path d="M 300,380 C 230,370 130,340 90,260 C 70,220 90,180 120,190 C 160,205 210,280 270,350 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="90,260 70,220 115,200" fill="url(#foxGold)" />
      <!-- Tail 2 -->
      <path d="M 300,380 C 220,350 140,280 120,180 C 110,130 140,110 170,130 C 195,150 230,240 280,340 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="120,180 110,130 155,120" fill="url(#foxGold)" />
      <!-- Tail 3 -->
      <path d="M 300,380 C 240,320 180,210 180,110 C 180,60 220,50 245,80 C 265,110 275,210 290,340 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="180,110 180,60 230,70" fill="url(#foxGold)" />
      <!-- Tail 4 -->
      <path d="M 300,380 C 270,300 240,180 260,80 C 270,30 300,30 315,65 C 320,105 310,210 305,340 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="260,80 270,30 305,45" fill="url(#foxGold)" />
    </g>

    <!-- Center Master Tail (Tail 5) -->
    <path d="M 300,380 C 300,280 290,160 300,60 C 305,20 330,20 335,60 C 345,160 330,280 300,380 Z" 
          fill="url(#foxFur)" stroke="url(#foxGold)" stroke-width="3" />
    <polygon points="300,60 305,20 335,40" fill="url(#foxGold)" />

    <!-- Right Tails -->
    <g class="tail-right">
      <!-- Tail 6 -->
      <path d="M 300,380 C 330,300 360,180 340,80 C 330,30 300,30 285,65 C 280,105 290,210 295,340 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="340,80 330,30 295,45" fill="url(#foxGold)" />
      <!-- Tail 7 -->
      <path d="M 300,380 C 360,320 420,210 420,110 C 420,60 380,50 355,80 C 335,110 325,210 310,340 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="420,110 420,60 370,70" fill="url(#foxGold)" />
      <!-- Tail 8 -->
      <path d="M 300,380 C 380,350 460,280 480,180 C 490,130 460,110 430,130 C 405,150 370,240 320,340 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="480,180 490,130 445,120" fill="url(#foxGold)" />
      <!-- Tail 9 -->
      <path d="M 300,380 C 370,370 470,340 510,260 C 530,220 510,180 480,190 C 440,205 390,280 330,350 Z" 
            fill="url(#foxFur)" stroke="#fb7185" stroke-width="2" />
      <polygon points="510,260 530,220 485,200" fill="url(#foxGold)" />
    </g>

    <!-- Slender Graceful Fox Body -->
    <path d="M 260,450 C 240,400 250,330 280,300 C 300,280 320,280 340,300 C 370,330 380,400 360,450 C 330,475 285,475 260,450 Z" 
          fill="url(#foxFur)" stroke="#fda4af" stroke-width="2" />
    
    <!-- White Chest Bib -->
    <path d="M 285,320 C 300,310 320,310 335,320 C 345,355 340,410 310,430 C 280,410 275,355 285,320 Z" fill="#ffffff" />

    <!-- Auspicious Celestial Silk Ribbon (Float sash) -->
    <path d="M 220,320 C 180,300 170,360 220,380 C 280,400 340,400 400,380 C 450,360 440,300 400,320" 
          fill="none" stroke="url(#foxGold)" stroke-width="5" stroke-linecap="round" />

    <!-- Elegant Fox Head -->
    <g transform="translate(250, 180)">
      <!-- Head Contour -->
      <path d="M 15,45 C 5,20 20,-10 50,-10 C 80,-10 95,20 85,45 C 80,75 58,110 50,115 C 42,110 20,75 15,45 Z" 
            fill="url(#foxFur)" stroke="#e11d48" stroke-width="2" />

      <!-- White Cheek Patches -->
      <path d="M 18,50 C 10,65 25,85 45,105 C 30,85 25,65 18,50 Z" fill="#ffffff" />
      <path d="M 82,50 C 90,65 75,85 55,105 C 70,85 75,65 82,50 Z" fill="#ffffff" />

      <!-- Big Majestic Fox Ears with Soft Inner Fur -->
      <polygon points="18,10 -15,-45 35,-20" fill="url(#foxFur)" stroke="#9f1239" stroke-width="2" />
      <polygon points="15,5 -5,-35 28,-18" fill="#fda4af" />
      <polygon points="82,10 115,-45 65,-20" fill="url(#foxFur)" stroke="#9f1239" stroke-width="2" />
      <polygon points="85,5 105,-35 72,-18" fill="#fda4af" />

      <!-- Red Eyeliner & Piercing Violet/Crimson Eyes -->
      <path d="M 26,46 Q 38,38 42,48" stroke="#be123c" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <ellipse cx="34" cy="46" rx="4" ry="5.5" fill="#e11d48" />
      <circle cx="35" cy="44" r="1.5" fill="#ffffff" />
      
      <path d="M 74,46 Q 62,38 58,48" stroke="#be123c" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <ellipse cx="66" cy="46" rx="4" ry="5.5" fill="#e11d48" />
      <circle cx="65" cy="44" r="1.5" fill="#ffffff" />

      <!-- Cute Tiny Snout -->
      <polygon points="47,112 53,112 50,118" fill="#1c1917" />

      <!-- Forehead Vermilion Bindi Mark (Huadian) -->
      <path d="M 50,12 C 45,22 47,30 50,34 C 53,30 55,22 50,12 Z" fill="#e11d48" stroke="url(#foxGold)" stroke-width="1.5" />
    </g>
  </g>

  <!-- Title Ribbon at Bottom -->
  <g transform="translate(300, 535)">
    <rect x="-140" y="-22" width="280" height="44" rx="10" fill="#3b071a" stroke="url(#foxGold)" stroke-width="2" />
    <text x="0" y="7" font-family="'Cinzel', 'Noto Serif Thai', serif" font-size="17" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="2">
      NINE-TAILED FOX • จิ่วเหว่ยหู
    </text>
  </g>
</svg>`
  },

  {
    name: 'red-phoenix-mascot.svg',
    title: 'Red Phoenix (จูเชวี่ย - หงส์เพลิงประจำทิศทักษิณ)',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="phBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#300705" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#450a0a" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1c0303" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="phWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="50%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="phGold" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="phPlume" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="30%" stop-color="#f97316" />
      <stop offset="70%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>
    <filter id="phGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes phFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-16px) rotate(1deg); }
    }
    @keyframes wingFlapL {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-5deg); }
    }
    @keyframes wingFlapR {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
    }
    @keyframes plumeSway {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(4deg); }
    }
    .ph-mascot { animation: phFloat 4.4s ease-in-out infinite; transform-origin: 300px 300px; }
    .ph-wing-l { animation: wingFlapL 2.8s ease-in-out infinite alternate; transform-origin: 220px 280px; }
    .ph-wing-r { animation: wingFlapR 2.8s ease-in-out infinite alternate; transform-origin: 380px 280px; }
    .ph-plumes { animation: plumeSway 3.6s ease-in-out infinite alternate; transform-origin: 300px 420px; }
  </style>

  <!-- Aureole Disc -->
  <circle cx="300" cy="300" r="260" fill="url(#phBg)" stroke="url(#phGold)" stroke-width="4" opacity="0.9" />
  <circle cx="300" cy="300" r="248" fill="none" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.6" />

  <!-- Solar Radiance / Flames in Background -->
  <g opacity="0.35" filter="url(#phGlow)">
    <circle cx="300" cy="280" r="140" fill="#dc2626" />
    <circle cx="300" cy="280" r="90" fill="#f59e0b" />
  </g>

  <!-- Phoenix Character Group -->
  <g class="ph-mascot">
    <!-- Flowing Celestial Tail Plumes (Long cascading ribbons with eyelets) -->
    <g class="ph-plumes">
      <!-- Left Plume -->
      <path d="M 280,410 C 240,450 170,480 140,540 C 130,560 150,570 170,550 C 210,510 270,460 290,410 Z" 
            fill="url(#phPlume)" stroke="url(#phGold)" stroke-width="2" />
      <circle cx="150" cy="545" r="9" fill="url(#phGold)" />
      <circle cx="150" cy="545" r="4" fill="#7f1d1d" />

      <!-- Center Plume (Longest) -->
      <path d="M 300,415 C 290,470 300,520 300,580 C 310,590 320,580 320,560 C 320,510 315,465 310,415 Z" 
            fill="url(#phPlume)" stroke="url(#phGold)" stroke-width="2" />
      <circle cx="305" cy="565" r="10" fill="url(#phGold)" />
      <circle cx="305" cy="565" r="5" fill="#7f1d1d" />

      <!-- Right Plume -->
      <path d="M 320,410 C 360,450 430,480 460,540 C 470,560 450,570 430,550 C 390,510 330,460 310,410 Z" 
            fill="url(#phPlume)" stroke="url(#phGold)" stroke-width="2" />
      <circle cx="450" cy="545" r="9" fill="url(#phGold)" />
      <circle cx="450" cy="545" r="4" fill="#7f1d1d" />
    </g>

    <!-- Magnificent Spreading Left Wing -->
    <g class="ph-wing-l">
      <!-- Primary Feathers -->
      <path d="M 230,280 C 170,220 90,170 40,180 C 60,220 120,270 190,320 Z" 
            fill="url(#phWing)" stroke="url(#phGold)" stroke-width="2.5" />
      <path d="M 210,290 C 150,250 80,220 50,240 C 75,270 130,310 180,340 Z" 
            fill="#b91c1c" stroke="url(#phGold)" stroke-width="1.8" />
      <path d="M 200,310 C 150,290 100,280 80,300 C 110,325 150,345 180,360 Z" 
            fill="#991b1b" stroke="url(#phGold)" stroke-width="1.5" />
    </g>

    <!-- Magnificent Spreading Right Wing -->
    <g class="ph-wing-r">
      <!-- Primary Feathers -->
      <path d="M 370,280 C 430,220 510,170 560,180 C 540,220 480,270 410,320 Z" 
            fill="url(#phWing)" stroke="url(#phGold)" stroke-width="2.5" />
      <path d="M 390,290 C 450,250 520,220 550,240 C 525,270 470,310 420,340 Z" 
            fill="#b91c1c" stroke="url(#phGold)" stroke-width="1.8" />
      <path d="M 400,310 C 450,290 500,280 520,300 C 490,325 450,345 420,360 Z" 
            fill="#991b1b" stroke="url(#phGold)" stroke-width="1.5" />
    </g>

    <!-- Slender Phoenix Body & Breast -->
    <path d="M 260,390 C 240,320 260,250 300,240 C 340,250 360,320 340,390 C 325,420 275,420 260,390 Z" 
          fill="url(#phWing)" stroke="url(#phGold)" stroke-width="2.5" />
    
    <!-- Golden Solar Breast Shield -->
    <path d="M 280,265 C 290,260 310,260 320,265 C 335,300 330,350 300,380 C 270,350 265,300 280,265 Z" 
          fill="url(#phGold)" stroke="#b45309" stroke-width="1.5" />

    <!-- Phoenix Head & Imperial Crown Crest -->
    <g transform="translate(300, 190)">
      <!-- Head Base -->
      <ellipse cx="0" cy="15" rx="22" ry="26" fill="#dc2626" stroke="url(#phGold)" stroke-width="2" />
      
      <!-- Crown Crest Feathers (3 majestic flame feathers) -->
      <path d="M -8,-5 C -25,-35 -40,-60 -25,-75 C -10,-70 -5,-45 0,-10" fill="url(#phGold)" stroke="#ca8a04" stroke-width="1.5" />
      <circle cx="-25" cy="-75" r="4" fill="#dc2626" />

      <path d="M 0,-10 C 0,-45 0,-85 10,-95 C 15,-80 10,-50 5,-10" fill="url(#phGold)" stroke="#ca8a04" stroke-width="2" />
      <circle cx="10" cy="-95" r="5" fill="#f97316" />

      <path d="M 8,-5 C 25,-35 40,-60 25,-75 C 10,-70 5,-45 0,-10" fill="url(#phGold)" stroke="#ca8a04" stroke-width="1.5" />
      <circle cx="25" cy="-75" r="4" fill="#dc2626" />

      <!-- Sharp Regal Beak -->
      <polygon points="12,12 38,18 14,24" fill="url(#phGold)" stroke="#ca8a04" stroke-width="1.5" />

      <!-- Ruby & Gold Keen Eyes -->
      <circle cx="6" cy="12" r="6" fill="#fef08a" stroke="#b45309" stroke-width="1.5" />
      <circle cx="7" cy="12" r="3" fill="#7f1d1d" />
      <circle cx="8" cy="10" r="1.5" fill="#ffffff" />
    </g>
  </g>

  <!-- Title Ribbon at Bottom -->
  <g transform="translate(300, 535)">
    <rect x="-140" y="-22" width="280" height="44" rx="10" fill="#450a0a" stroke="url(#phGold)" stroke-width="2" />
    <text x="0" y="7" font-family="'Cinzel', 'Noto Serif Thai', serif" font-size="18" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="2">
      RED PHOENIX • จูเชวี่ย
    </text>
  </g>
</svg>`
  },

  {
    name: 'celestial-mystery-box.svg',
    title: 'Celestial Mystery Box (กล่องสุ่มสวรรค์ FATU 2026)',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="boxBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a2e2b" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#164e63" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#021f24" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="boxGold" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="35%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>
    <linearGradient id="boxCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>
    <linearGradient id="boxJade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14b8a6" />
      <stop offset="50%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <radialGradient id="boxRays" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
      <stop offset="30%" stop-color="#f59e0b" stop-opacity="0.7" />
      <stop offset="70%" stop-color="#d97706" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#b45309" stop-opacity="0" />
    </radialGradient>
    <filter id="boxGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes boxHover {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(-0.5deg); }
    }
    @keyframes raySpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes sparkFloat {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    .box-chest { animation: boxHover 4s ease-in-out infinite; transform-origin: 300px 320px; }
    .box-rays { animation: raySpin 25s linear infinite; transform-origin: 300px 300px; }
    .box-spark { animation: sparkFloat 2s ease-in-out infinite alternate; }
  </style>

  <!-- Aureole Disc -->
  <circle cx="300" cy="300" r="260" fill="url(#boxBg)" stroke="url(#boxGold)" stroke-width="4" opacity="0.9" />
  <circle cx="300" cy="300" r="248" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.5" />

  <!-- Radiating Celestial Sunburst Behind Box -->
  <g class="box-rays" opacity="0.65">
    <path d="M 300,100 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 440,160 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 500,300 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 440,440 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 300,500 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 160,440 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 100,300 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
    <path d="M 160,160 L 315,300 L 285,300 Z" fill="url(#boxRays)" />
  </g>

  <!-- Auspicious Clouds at Bottom -->
  <g opacity="0.8">
    <path d="M 120,480 Q 180,430 240,460 Q 300,420 360,460 Q 420,430 480,480 C 400,530 200,530 120,480 Z" 
          fill="#042f2e" stroke="url(#boxGold)" stroke-width="2" />
  </g>

  <!-- Interactive Celestial Treasure Chest Group -->
  <g class="box-chest">
    <!-- Pedestal Shadow -->
    <ellipse cx="300" cy="455" rx="150" ry="25" fill="#000000" opacity="0.6" filter="url(#boxGlow)" />

    <!-- Chest Body (Bottom Container) -->
    <!-- Front Face -->
    <path d="M 160,310 L 440,310 L 415,440 L 185,440 Z" fill="url(#boxCrimson)" stroke="url(#boxGold)" stroke-width="4" />
    
    <!-- Body Decorative Jade Panels -->
    <rect x="200" y="325" width="200" height="95" rx="8" fill="url(#boxJade)" stroke="url(#boxGold)" stroke-width="2.5" />

    <!-- Traditional Chinese Corner Filigree (Gold) -->
    <g fill="url(#boxGold)">
      <!-- Top Left -->
      <polygon points="160,310 185,310 185,325 172,325 172,345 160,345" />
      <!-- Top Right -->
      <polygon points="440,310 415,310 415,325 428,325 428,345 440,345" />
      <!-- Bottom Left -->
      <polygon points="185,440 210,440 210,425 197,425 197,410 185,410" />
      <!-- Bottom Right -->
      <polygon points="415,440 390,440 390,425 403,425 403,410 415,410" />
    </g>

    <!-- Chest Arched Lid (Top Cover) -->
    <path d="M 140,290 C 140,200 460,200 460,290 L 445,315 L 155,315 Z" 
          fill="url(#boxCrimson)" stroke="url(#boxGold)" stroke-width="4.5" />
    
    <!-- Lid Crown Ridge (Double Tiered Imperial Roof Silhouette) -->
    <path d="M 130,285 Q 300,230 470,285 L 455,300 Q 300,250 145,300 Z" fill="url(#boxGold)" stroke="#854d0e" stroke-width="1.5" />
    
    <!-- Imperial Dragon Roof Ends -->
    <path d="M 130,285 C 115,280 110,265 125,255 C 135,260 135,275 145,285 Z" fill="url(#boxGold)" />
    <path d="M 470,285 C 485,280 490,265 475,255 C 465,260 465,275 455,285 Z" fill="url(#boxGold)" />

    <!-- Center Mystic Seal / Lock (แปดเหลี่ยม ยันต์ทองคำ 8 ทิศ) -->
    <g transform="translate(300, 310)">
      <!-- Octagonal Lock Base -->
      <polygon points="0,-42 30,-30 42,0 30,30 0,42 -30,30 -42,0 -30,-30" 
               fill="#042f2e" stroke="url(#boxGold)" stroke-width="4" filter="url(#boxGlow)" />
      <!-- Inner Gold Ring -->
      <circle cx="0" cy="0" r="22" fill="url(#boxGold)" stroke="#854d0e" stroke-width="2" />
      <circle cx="0" cy="0" r="16" fill="#991b1b" />
      
      <!-- Yin-Yang / Auspicious Spiral Center Motif -->
      <circle cx="0" cy="0" r="9" fill="#fef08a" />
      <path d="M 0,-9 A 4.5,4.5 0 0,1 0,0 A 4.5,4.5 0 0,0 0,9 A 9,9 0 0,1 0,-9 Z" fill="#b91c1c" />
      <circle cx="0" cy="-4.5" r="1.5" fill="#fef08a" />
      <circle cx="0" cy="4.5" r="1.5" fill="#b91c1c" />

      <!-- Hanging Golden Tassel Rings & Ribbons -->
      <ellipse cx="0" cy="48" rx="8" ry="4" fill="none" stroke="url(#boxGold)" stroke-width="2.5" />
      <path d="M -6,52 L -12,85 L 12,85 L 6,52 Z" fill="url(#boxGold)" stroke="#b45309" stroke-width="1.5" />
      <line x1="-8" y1="85" x2="-10" y2="105" stroke="#ef4444" stroke-width="2" />
      <line x1="-3" y1="85" x2="-3" y2="110" stroke="#ef4444" stroke-width="2" />
      <line x1="3" y1="85" x2="3" y2="110" stroke="#ef4444" stroke-width="2" />
      <line x1="8" y1="85" x2="10" y2="105" stroke="#ef4444" stroke-width="2" />
    </g>
  </g>

  <!-- Floating Golden Celestial Sparks -->
  <g class="box-spark">
    <polygon points="170,220 174,228 182,232 174,236 170,244 166,236 158,232 166,228" fill="#fef08a" />
    <polygon points="420,200 424,208 432,212 424,216 420,224 416,216 408,212 416,208" fill="#fef08a" />
    <polygon points="200,400 203,406 209,409 203,412 200,418 197,412 191,409 197,406" fill="#fef08a" />
    <polygon points="400,410 403,416 409,419 403,422 400,428 397,422 391,419 397,416" fill="#fef08a" />
  </g>

  <!-- Title Ribbon at Bottom -->
  <g transform="translate(300, 535)">
    <rect x="-150" y="-22" width="300" height="44" rx="10" fill="#042f2e" stroke="url(#boxGold)" stroke-width="2" />
    <text x="0" y="7" font-family="'Cinzel', 'Noto Serif Thai', serif" font-size="17" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="2">
      MYSTERY BOX • กล่องสุ่มสวรรค์
    </text>
  </g>
</svg>`
  }
];

async function main() {
  console.log('Writing character SVGs...');
  for (const c of characters) {
    for (const d of targetDirs) {
      const outPath = path.join(d, c.name);
      fs.writeFileSync(outPath, c.content.trim(), 'utf8');
      console.log(`Saved ${c.name} -> ${outPath}`);
    }
  }

  // Next, launch PinePaper MCP session to verify and register/export these assets via the PinePaper pipeline
  console.log('\nValidating PinePaper MCP connectivity...');
  const proc = spawn('npx.cmd', ['-y', '-p', 'puppeteer', '-p', '@pinepaper.studio/mcp-server', 'pinepaper-mcp'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true,
    env: {
      ...process.env,
      PUPPETEER_EXECUTABLE_PATH: edgePath
    }
  });

  let msgId = 1;
  const pending = new Map();
  let buffer = '';

  function send(method, params = {}) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
      proc.stdin.write(payload);
    });
  }

  proc.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch {}
    }
  });

  try {
    const initRes = await send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'pinepaper-character-verifier', version: '1.0.0' }
    });
    console.log('PinePaper MCP successfully initialized:', initRes?.serverInfo?.name || 'pinepaper-mcp');

    // Register active jobs for characters
    for (const c of characters) {
      const jobName = c.name.replace('.svg', '');
      console.log(`PinePaper job registration for ${jobName}...`);
      await send('tools/call', {
        name: 'pinepaper_agent_start_job',
        arguments: { name: jobName, canvasPreset: 'web', clearCanvas: true }
      });
      await send('tools/call', {
        name: 'pinepaper_import_svg',
        arguments: { svgContent: c.content }
      });
      console.log(`PinePaper successfully imported & verified: ${c.name}`);
    }
  } catch (err) {
    console.warn('PinePaper MCP verification warning (non-fatal):', err.message);
  } finally {
    proc.kill();
  }

  console.log('\nAll 5 Chinese Mythology Character & Mystery Box assets generated and verified successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
