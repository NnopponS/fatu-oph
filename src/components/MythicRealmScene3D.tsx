import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type RealmKey = "azure-dragon" | "white-tiger" | "nine-tailed-fox" | "red-phoenix";

export interface MythicRealmScene3DProps {
  /** Current active stage of the story: 0 = Awakening, 1 = Choose Realm, 2 = Quest/Chest, 3 = Seal */
  stage: number;
  /** Currently selected realm during stage 1 */
  selectedRealm?: RealmKey | null;
  /** Callback when user clicks on a 3D realm totem */
  onSelectRealm?: (realm: RealmKey) => void;
  /** Height in pixels or dynamic CSS sizing */
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

interface RealmVisualConfig {
  name: string;
  beastName: string;
  place: string;
  dept: string;
  angle: number;
  color: number;
  emissive: number;
  glowColor: number;
  tileColor: number;
  tileEmissive: number;
  image: string;
  calligraphyChar: string;
  camOffset: { x: number; y: number; z: number };
}

const REALM_VISUALS: Record<RealmKey, RealmVisualConfig> = {
  "azure-dragon": {
    name: "แดนมังกรฟ้า",
    beastName: "มังกรฟ้าสวรรค์",
    place: "โรงละคร",
    dept: "ศิลปะการแสดง",
    angle: Math.PI / 2, // North
    color: 0x0284c7,
    emissive: 0x0369a1,
    glowColor: 0x38bdf8,
    tileColor: 0x1d4ed8, // Imperial Cobalt Blue Glazed Tile
    tileEmissive: 0x172554,
    image: "/images/azure-dragon-art.jpg",
    calligraphyChar: "龍",
    camOffset: { x: 0, y: 1.4, z: 1.5 },
  },
  "white-tiger": {
    name: "แดนพยัคฆ์ขาว",
    beastName: "พยัคฆ์ขาวคำราม",
    place: "ตึกคณะ",
    dept: "ทัศนศิลป์",
    angle: Math.PI, // West
    color: 0xd97706,
    emissive: 0xb45309,
    glowColor: 0xfbbf24,
    tileColor: 0xd97706, // Imperial Amber Gold Glazed Tile
    tileEmissive: 0x78350f,
    image: "/images/white-tiger-art.jpg",
    calligraphyChar: "虎",
    camOffset: { x: -1.5, y: 1.4, z: 0 },
  },
  "nine-tailed-fox": {
    name: "แดนจิ้งจอกเก้าหาง",
    beastName: "จิ้งจอกเก้าหางพยากรณ์",
    place: "โรงทอ",
    dept: "พัสตราภรณ์",
    angle: (Math.PI * 3) / 2, // South
    color: 0xdb2777,
    emissive: 0xbe185d,
    glowColor: 0xf472b6,
    tileColor: 0x9d174d, // Royal Plum Orchid Glazed Tile
    tileEmissive: 0x500724,
    image: "/images/nine-tailed-fox-art.jpg",
    calligraphyChar: "狐",
    camOffset: { x: 0, y: 1.4, z: -1.5 },
  },
  "red-phoenix": {
    name: "แดนวิหคเพลิง",
    beastName: "วิหคเพลิงอมตะ",
    place: "ตึก SC3",
    dept: "สื่อสร้างสรรค์",
    angle: 0, // East
    color: 0xdc2626,
    emissive: 0xb91c1c,
    glowColor: 0xf87171,
    tileColor: 0xb91c1c, // Vermilion Crimson Glazed Tile
    tileEmissive: 0x450a0a,
    image: "/images/red-phoenix-art.jpg",
    calligraphyChar: "雀",
    camOffset: { x: 1.5, y: 1.4, z: 0 },
  },
};

/**
 * Generates an ornate 512x512 Bagua / Yin-Yang circular canvas texture
 */
function createBaguaFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 256;
  const cy = 256;

  // Background dark imperial bronze
  ctx.fillStyle = "#221309";
  ctx.beginPath();
  ctx.arc(cx, cy, 252, 0, Math.PI * 2);
  ctx.fill();

  // Outer gold rings
  ctx.strokeStyle = "#eab308";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 218, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.stroke();

  // 8 Trigram Sectors & Symbols
  const trigramSymbols = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];
  ctx.font = "bold 32px serif";
  ctx.fillStyle = "#fef08a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 8; i++) {
    const rad = (i * Math.PI) / 4;
    const x = cx + Math.cos(rad) * 200;
    const y = cy + Math.sin(rad) * 200;

    // Small radial tick lines
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * 180, cy + Math.sin(rad) * 180);
    ctx.lineTo(cx + Math.cos(rad) * 218, cy + Math.sin(rad) * 218);
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rad + Math.PI / 2);
    ctx.fillText(trigramSymbols[i], 0, 0);
    ctx.restore();
  }

  // Inner Yin-Yang circle
  const yr = 110;
  // White half
  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.arc(cx, cy, yr, -Math.PI / 2, Math.PI / 2, false);
  ctx.arc(cx, cy + yr / 2, yr / 2, Math.PI / 2, -Math.PI / 2, true);
  ctx.arc(cx, cy - yr / 2, yr / 2, Math.PI / 2, -Math.PI / 2, false);
  ctx.fill();

  // Red Cinnabar half
  ctx.fillStyle = "#881337";
  ctx.beginPath();
  ctx.arc(cx, cy, yr, Math.PI / 2, -Math.PI / 2, false);
  ctx.arc(cx, cy - yr / 2, yr / 2, -Math.PI / 2, Math.PI / 2, true);
  ctx.arc(cx, cy + yr / 2, yr / 2, -Math.PI / 2, Math.PI / 2, false);
  ctx.fill();

  // Yin-Yang inner dots
  ctx.fillStyle = "#881337";
  ctx.beginPath();
  ctx.arc(cx, cy - yr / 2, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.arc(cx, cy + yr / 2, 16, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Creates an authentic Chinese Pagoda Pavilion (เก๋งจีนโบราณ) with:
 * - Han White Marble stepped foundation with golden lotus rim
 * - 4 Imperial Vermilion pillars with brass bases and golden Dougong bracket capitals
 * - Front pillars wrapped with Coiled Dragon rings (盘龙柱)
 * - Double-tiered octagonal glazed tile roof (琉璃瓦) with flying eaves (飞檐) and ridge beasts
 * - Imperial golden pagoda finial spire (宝顶)
 * - Suspended glowing crimson palace lanterns (宫灯)
 * - Ceremonial screen displaying the mythical beast painting
 * - Luminous Sacred Dragon Pearl (神兽灵珠) enclosed within spinning golden orbital rings
 * - Ornate golden Dragon Archway header (牌匾)
 */
function createPagodaShrine(
  cfg: RealmVisualConfig,
  artTexture: THREE.Texture,
  disposables: { dispose: () => void }[]
): THREE.Group {
  const shrineGroup = new THREE.Group();

  // Shared reusable materials
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f4,
    roughness: 0.35,
    metalness: 0.1,
  });
  disposables.push(marbleMat);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.88,
    roughness: 0.2,
    emissive: 0x78350f,
    emissiveIntensity: 0.35,
  });
  disposables.push(goldMat);

  const redWoodMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.3,
    metalness: 0.15,
  });
  disposables.push(redWoodMat);

  const glazedTileMat = new THREE.MeshStandardMaterial({
    color: cfg.tileColor,
    roughness: 0.28,
    metalness: 0.35,
    emissive: cfg.tileEmissive,
    emissiveIntensity: 0.35,
  });
  disposables.push(glazedTileMat);

  // 1. White Han Marble Stepped Foundation (汉白玉台基)
  const baseGeom = new THREE.CylinderGeometry(1.0, 1.15, 0.2, 8);
  disposables.push(baseGeom);
  const baseMesh = new THREE.Mesh(baseGeom, marbleMat);
  baseMesh.position.y = 0.1;
  shrineGroup.add(baseMesh);

  // Golden lotus border ring on marble base
  const goldRingGeom = new THREE.TorusGeometry(1.02, 0.025, 8, 32);
  disposables.push(goldRingGeom);
  const goldRing = new THREE.Mesh(goldRingGeom, goldMat);
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.2;
  shrineGroup.add(goldRing);

  // Upper dais platform
  const daisGeom = new THREE.CylinderGeometry(0.82, 0.9, 0.12, 8);
  disposables.push(daisGeom);
  const daisMesh = new THREE.Mesh(daisGeom, marbleMat);
  daisMesh.position.y = 0.26;
  shrineGroup.add(daisMesh);

  // 2. Four Imperial Red Wooden Pillars with Golden Dragon Rings (盘龙柱)
  const pillarRadius = 0.048;
  const pillarHeight = 1.32;
  const pillarSpread = 0.48;
  const pillarGeom = new THREE.CylinderGeometry(pillarRadius, pillarRadius * 1.08, pillarHeight, 12);
  disposables.push(pillarGeom);

  const pillarPositions = [
    { x: -pillarSpread, z: -pillarSpread, isFront: false },
    { x: pillarSpread, z: -pillarSpread, isFront: false },
    { x: -pillarSpread, z: pillarSpread, isFront: true },
    { x: pillarSpread, z: pillarSpread, isFront: true },
  ];

  pillarPositions.forEach((pos) => {
    // Red pillar shaft
    const pillar = new THREE.Mesh(pillarGeom, redWoodMat);
    pillar.position.set(pos.x, 0.32 + pillarHeight / 2, pos.z);
    shrineGroup.add(pillar);

    // Brass pedestal base
    const baseCapGeom = new THREE.CylinderGeometry(pillarRadius * 1.5, pillarRadius * 1.8, 0.05, 12);
    disposables.push(baseCapGeom);
    const baseCap = new THREE.Mesh(baseCapGeom, goldMat);
    baseCap.position.set(pos.x, 0.34, pos.z);
    shrineGroup.add(baseCap);

    // Golden Dougong (斗拱) bracket cluster on top
    const dougongGeom = new THREE.BoxGeometry(0.14, 0.08, 0.14);
    disposables.push(dougongGeom);
    const dougong = new THREE.Mesh(dougongGeom, goldMat);
    dougong.position.set(pos.x, 0.32 + pillarHeight, pos.z);
    shrineGroup.add(dougong);

    // Front pillars: Coiled golden dragon relief rings climbing up
    if (pos.isFront) {
      for (let r = 0; r < 4; r++) {
        const ringTorus = new THREE.TorusGeometry(pillarRadius * 1.18, 0.012, 6, 16);
        disposables.push(ringTorus);
        const dragonBand = new THREE.Mesh(ringTorus, goldMat);
        dragonBand.rotation.x = Math.PI / 2 + 0.18;
        dragonBand.position.set(pos.x, 0.52 + r * 0.26, pos.z);
        shrineGroup.add(dragonBand);
      }
    }
  });

  // 3. Double-tiered Octagonal Glazed Pagoda Roof with Flying Eaves (飞檐翘角)
  // --- Tier 1: Lower Flared Glazed Eave ---
  const lowerEaveGeom = new THREE.CylinderGeometry(0.35, 1.22, 0.28, 8);
  disposables.push(lowerEaveGeom);
  const lowerEave = new THREE.Mesh(lowerEaveGeom, glazedTileMat);
  lowerEave.position.y = 1.76;
  shrineGroup.add(lowerEave);

  // Lower golden eave rim
  const lowerGoldRimGeom = new THREE.CylinderGeometry(1.24, 1.25, 0.03, 8);
  disposables.push(lowerGoldRimGeom);
  const lowerGoldRim = new THREE.Mesh(lowerGoldRimGeom, goldMat);
  lowerGoldRim.position.y = 1.62;
  shrineGroup.add(lowerGoldRim);

  // Dougong bracket apron under lower eave
  const bracketApronGeom = new THREE.CylinderGeometry(0.8, 0.88, 0.07, 8);
  disposables.push(bracketApronGeom);
  const bracketApron = new THREE.Mesh(bracketApronGeom, redWoodMat);
  bracketApron.position.y = 1.63;
  shrineGroup.add(bracketApron);

  // 8 Upturned Flying Eave Tips (飞檐) for Tier 1
  for (let i = 0; i < 8; i++) {
    const tipAngle = (i * Math.PI) / 4;
    const tipGeom = new THREE.ConeGeometry(0.04, 0.14, 4);
    disposables.push(tipGeom);
    const tipMesh = new THREE.Mesh(tipGeom, goldMat);
    tipMesh.position.set(Math.cos(tipAngle) * 1.25, 1.66, Math.sin(tipAngle) * 1.25);
    tipMesh.rotation.z = Math.PI / 3;
    tipMesh.rotation.y = -tipAngle;
    shrineGroup.add(tipMesh);
  }

  // --- Tier 2: Upper Glazed Pagoda Roof ---
  const upperEaveGeom = new THREE.CylinderGeometry(0.14, 0.82, 0.28, 8);
  disposables.push(upperEaveGeom);
  const upperEave = new THREE.Mesh(upperEaveGeom, glazedTileMat);
  upperEave.position.y = 2.05;
  shrineGroup.add(upperEave);

  const upperGoldRimGeom = new THREE.CylinderGeometry(0.84, 0.85, 0.03, 8);
  disposables.push(upperGoldRimGeom);
  const upperGoldRim = new THREE.Mesh(upperGoldRimGeom, goldMat);
  upperGoldRim.position.y = 1.91;
  shrineGroup.add(upperGoldRim);

  // 8 Upturned Flying Eave Tips for Tier 2
  for (let i = 0; i < 8; i++) {
    const tipAngle = (i * Math.PI) / 4;
    const tipGeom = new THREE.ConeGeometry(0.032, 0.12, 4);
    disposables.push(tipGeom);
    const tipMesh = new THREE.Mesh(tipGeom, goldMat);
    tipMesh.position.set(Math.cos(tipAngle) * 0.86, 1.95, Math.sin(tipAngle) * 0.86);
    tipMesh.rotation.z = Math.PI / 3;
    tipMesh.rotation.y = -tipAngle;
    shrineGroup.add(tipMesh);
  }

  // --- Imperial Pagoda Finial Spire (宝顶) ---
  const lotusBaseGeom = new THREE.CylinderGeometry(0.12, 0.06, 0.06, 12);
  disposables.push(lotusBaseGeom);
  const lotusBase = new THREE.Mesh(lotusBaseGeom, goldMat);
  lotusBase.position.y = 2.22;
  shrineGroup.add(lotusBase);

  const finialBallGeom = new THREE.SphereGeometry(0.08, 16, 16);
  disposables.push(finialBallGeom);
  const finialBall = new THREE.Mesh(finialBallGeom, goldMat);
  finialBall.position.y = 2.3;
  shrineGroup.add(finialBall);

  const finialSpireGeom = new THREE.ConeGeometry(0.045, 0.24, 12);
  disposables.push(finialSpireGeom);
  const finialSpire = new THREE.Mesh(finialSpireGeom, goldMat);
  finialSpire.position.y = 2.45;
  shrineGroup.add(finialSpire);

  // 4. Two Suspended Crimson Palace Lanterns (宫灯)
  const lanternOffsets = [
    { x: -0.62, z: 0.62 },
    { x: 0.62, z: 0.62 },
  ];

  lanternOffsets.forEach((lpos) => {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(lpos.x, 1.5, lpos.z);

    // Golden suspension cord
    const cordGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6);
    disposables.push(cordGeom);
    const cordMesh = new THREE.Mesh(cordGeom, goldMat);
    cordMesh.position.y = 0.08;
    lanternGroup.add(cordMesh);

    // Glowing Crimson Silk Lantern Body
    const bodyGeom = new THREE.SphereGeometry(0.11, 16, 12);
    disposables.push(bodyGeom);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    disposables.push(lanternMat);
    const bodyMesh = new THREE.Mesh(bodyGeom, lanternMat);
    bodyMesh.scale.set(1, 1.25, 1);
    lanternGroup.add(bodyMesh);

    // Gold rings top and bottom
    const ringGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.02, 12);
    disposables.push(ringGeom);
    const topRing = new THREE.Mesh(ringGeom, goldMat);
    topRing.position.y = 0.13;
    lanternGroup.add(topRing);
    const botRing = new THREE.Mesh(ringGeom, goldMat);
    botRing.position.y = -0.13;
    lanternGroup.add(botRing);

    // Silk Tassel
    const tasselGeom = new THREE.ConeGeometry(0.03, 0.12, 8);
    disposables.push(tasselGeom);
    const tasselMesh = new THREE.Mesh(tasselGeom, redWoodMat);
    tasselMesh.position.y = -0.2;
    tasselMesh.rotation.x = Math.PI;
    lanternGroup.add(tasselMesh);

    // Warm lantern light
    const lanternLight = new THREE.PointLight(0xffedd5, 0.85, 2.2);
    lanternLight.position.set(0, 0, 0);
    lanternGroup.add(lanternLight);

    shrineGroup.add(lanternGroup);
  });

  // 5. Ceremonial Artwork Screen & Mythological Beast Shrine Core
  const altarCoreGroup = new THREE.Group();
  altarCoreGroup.position.set(0, 0.85, 0);

  // Lacquered Screen Frame (Dark Rosewood)
  const screenFrameGeom = new THREE.BoxGeometry(0.72, 0.88, 0.04);
  disposables.push(screenFrameGeom);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x2b130a,
    metalness: 0.5,
    roughness: 0.35,
  });
  disposables.push(frameMat);
  const screenFrame = new THREE.Mesh(screenFrameGeom, frameMat);
  altarCoreGroup.add(screenFrame);

  // Artwork Canvas Face - Uses the direct THREE.Texture instance so it updates automatically
  const artFaceGeom = new THREE.PlaneGeometry(0.64, 0.8);
  disposables.push(artFaceGeom);
  const artMaterial = new THREE.MeshStandardMaterial({
    map: artTexture,
    roughness: 0.3,
    metalness: 0.1,
  });
  disposables.push(artMaterial);

  const artFaceFront = new THREE.Mesh(artFaceGeom, artMaterial);
  artFaceFront.position.z = 0.022;
  altarCoreGroup.add(artFaceFront);

  const artFaceBack = new THREE.Mesh(artFaceGeom, artMaterial);
  artFaceBack.rotation.y = Math.PI;
  artFaceBack.position.z = -0.022;
  altarCoreGroup.add(artFaceBack);

  // Golden Archway Header / Dragon Plaque (牌匾)
  const plaqueGeom = new THREE.BoxGeometry(0.78, 0.12, 0.06);
  disposables.push(plaqueGeom);
  const plaque = new THREE.Mesh(plaqueGeom, goldMat);
  plaque.position.y = 0.48;
  altarCoreGroup.add(plaque);

  // 6. Luminous Sacred Dragon Pearl (神兽灵珠) & Spinning Orbital Rings
  const pearlGeom = new THREE.SphereGeometry(0.14, 24, 24);
  disposables.push(pearlGeom);
  const pearlMat = new THREE.MeshStandardMaterial({
    color: cfg.glowColor,
    emissive: cfg.color,
    emissiveIntensity: 0.9,
    metalness: 0.3,
    roughness: 0.1,
  });
  disposables.push(pearlMat);
  const pearlMesh = new THREE.Mesh(pearlGeom, pearlMat);
  pearlMesh.position.y = 0.72;
  altarCoreGroup.add(pearlMesh);

  // Interlocking Golden Orbital Rings
  const orbitRing1Geom = new THREE.TorusGeometry(0.22, 0.012, 8, 32);
  disposables.push(orbitRing1Geom);
  const orbitRing1 = new THREE.Mesh(orbitRing1Geom, goldMat);
  orbitRing1.position.y = 0.72;
  orbitRing1.rotation.x = Math.PI / 4;
  altarCoreGroup.add(orbitRing1);

  const orbitRing2Geom = new THREE.TorusGeometry(0.24, 0.012, 8, 32);
  disposables.push(orbitRing2Geom);
  const orbitRing2 = new THREE.Mesh(orbitRing2Geom, goldMat);
  orbitRing2.position.y = 0.72;
  orbitRing2.rotation.y = Math.PI / 3;
  orbitRing2.rotation.x = -Math.PI / 4;
  altarCoreGroup.add(orbitRing2);

  // Shrine Element Light
  const elementLight = new THREE.PointLight(cfg.glowColor, 1.4, 3.2);
  elementLight.position.set(0, 0.72, 0.25);
  altarCoreGroup.add(elementLight);

  shrineGroup.add(altarCoreGroup);

  return shrineGroup;
}

/**
 * Creates an ornate Imperial Chinese Treasure Chest (หีบสวรรค์จักรพรรดิ 3D)
 * with deep crimson lacquer wood, gilded dragon corner wraps, brass sliding lock,
 * open domed arched lid, overflowing with 3D gold Yuanbao, ancient coins,
 * radiant jade pearls, and shimmering volumetric divine aura.
 */
function createImperialChest(disposables: { dispose: () => void }[]): THREE.Group {
  const chestGroup = new THREE.Group();

  const lacquerMat = new THREE.MeshStandardMaterial({
    color: 0x571212, // Imperial crimson lacquer wood
    roughness: 0.3,
    metalness: 0.18,
  });
  disposables.push(lacquerMat);

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.92,
    roughness: 0.18,
    emissive: 0x78350f,
    emissiveIntensity: 0.35,
  });
  disposables.push(brassMat);

  const pureGoldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.95,
    roughness: 0.12,
    emissive: 0x92400e,
    emissiveIntensity: 0.45,
  });
  disposables.push(pureGoldMat);

  const jadeMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.2,
    roughness: 0.1,
    emissive: 0x047857,
    emissiveIntensity: 0.7,
  });
  disposables.push(jadeMat);

  // 1. Lower Chest Body
  const boxGeom = new THREE.BoxGeometry(0.86, 0.44, 0.58);
  disposables.push(boxGeom);
  const boxMesh = new THREE.Mesh(boxGeom, lacquerMat);
  boxMesh.position.y = 0.22;
  chestGroup.add(boxMesh);

  // Gilded Brass Corner Wraps & Trim Plates
  const frontPlateGeom = new THREE.BoxGeometry(0.88, 0.46, 0.03);
  disposables.push(frontPlateGeom);
  const frontPlate = new THREE.Mesh(frontPlateGeom, brassMat);
  frontPlate.position.set(0, 0.22, 0.28);
  chestGroup.add(frontPlate);

  // Traditional Chinese Brass Faceplate & Lock Hasp (铜锁面)
  const lockPlateGeom = new THREE.BoxGeometry(0.18, 0.16, 0.04);
  disposables.push(lockPlateGeom);
  const lockPlate = new THREE.Mesh(lockPlateGeom, brassMat);
  lockPlate.position.set(0, 0.26, 0.305);
  chestGroup.add(lockPlate);

  // Side Brass Lion-Mask Handles
  [-0.44, 0.44].forEach((sideX) => {
    const handleGeom = new THREE.TorusGeometry(0.06, 0.015, 8, 16);
    disposables.push(handleGeom);
    const handle = new THREE.Mesh(handleGeom, brassMat);
    handle.position.set(sideX, 0.24, 0);
    handle.rotation.y = Math.PI / 2;
    chestGroup.add(handle);
  });

  // 2. Arched Domed Lid (Open at 42 degrees)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.44, -0.28); // Hinge pivot at back top edge

  // Half-cylinder curved lid
  const lidCylGeom = new THREE.CylinderGeometry(0.29, 0.29, 0.86, 16, 1, false, 0, Math.PI);
  disposables.push(lidCylGeom);
  const lidMesh = new THREE.Mesh(lidCylGeom, lacquerMat);
  lidMesh.rotation.z = Math.PI / 2;
  lidMesh.rotation.y = Math.PI / 2;
  lidMesh.position.set(0, 0, 0.28);
  lidGroup.add(lidMesh);

  // 3 Golden arched bands across the lid
  [-0.32, 0, 0.32].forEach((bandX) => {
    const bandGeom = new THREE.CylinderGeometry(0.295, 0.295, 0.06, 16, 1, false, 0, Math.PI);
    disposables.push(bandGeom);
    const band = new THREE.Mesh(bandGeom, brassMat);
    band.rotation.z = Math.PI / 2;
    band.rotation.y = Math.PI / 2;
    band.position.set(bandX, 0, 0.28);
    lidGroup.add(band);
  });

  // Open the lid wide
  lidGroup.rotation.x = -0.72; // ~42 degrees open
  chestGroup.add(lidGroup);

  // 3. Overflowing Treasures: Gold Yuanbao (元宝), Ancient Coins, and Jade Relics
  const treasureGroup = new THREE.Group();
  treasureGroup.position.set(0, 0.36, 0);

  // 6 Gold Sycees / Yuanbao (元宝)
  const yuanbaoPositions = [
    { x: 0, y: 0.08, z: 0.05, rot: 0.2 },
    { x: -0.22, y: 0.06, z: -0.06, rot: -0.4 },
    { x: 0.22, y: 0.07, z: -0.05, rot: 0.5 },
    { x: -0.12, y: 0.12, z: 0.1, rot: 0.1 },
    { x: 0.14, y: 0.13, z: 0.08, rot: -0.3 },
    { x: 0, y: 0.16, z: -0.04, rot: 0.7 },
  ];

  yuanbaoPositions.forEach((yp) => {
    const yb = new THREE.Group();
    yb.position.set(yp.x, yp.y, yp.z);
    yb.rotation.y = yp.rot;

    // Boat-shaped gold hull
    const hullGeom = new THREE.CylinderGeometry(0.075, 0.05, 0.055, 12);
    disposables.push(hullGeom);
    const hull = new THREE.Mesh(hullGeom, pureGoldMat);
    hull.scale.set(1.4, 1, 0.85);
    yb.add(hull);

    // Upturned wings
    const wingGeom = new THREE.SphereGeometry(0.04, 8, 8);
    disposables.push(wingGeom);
    const wingL = new THREE.Mesh(wingGeom, pureGoldMat);
    wingL.position.set(-0.08, 0.025, 0);
    yb.add(wingL);
    const wingR = new THREE.Mesh(wingGeom, pureGoldMat);
    wingR.position.set(0.08, 0.025, 0);
    yb.add(wingR);

    treasureGroup.add(yb);
  });

  // Ancient Bronze Fortune Coins (外圆内方 铜钱)
  for (let c = 0; c < 8; c++) {
    const coinGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.008, 16);
    disposables.push(coinGeom);
    const coin = new THREE.Mesh(coinGeom, brassMat);
    const cAngle = (c * Math.PI) / 4;
    coin.position.set(Math.cos(cAngle) * 0.26, 0.03 + (c % 3) * 0.015, Math.sin(cAngle) * 0.18);
    coin.rotation.x = 0.2;
    coin.rotation.z = Math.sin(c) * 0.3;
    treasureGroup.add(coin);
  }

  // Floating Sacred Jade & Ruby Relic Orbs
  const jadeOrbGeom = new THREE.SphereGeometry(0.055, 16, 16);
  disposables.push(jadeOrbGeom);
  const jadeOrb = new THREE.Mesh(jadeOrbGeom, jadeMat);
  jadeOrb.position.set(-0.16, 0.18, 0.04);
  treasureGroup.add(jadeOrb);

  const rubyMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.2,
    roughness: 0.1,
    emissive: 0xdc2626,
    emissiveIntensity: 0.8,
  });
  disposables.push(rubyMat);
  const rubyOrb = new THREE.Mesh(jadeOrbGeom, rubyMat);
  rubyOrb.position.set(0.18, 0.19, -0.02);
  treasureGroup.add(rubyOrb);

  chestGroup.add(treasureGroup);

  // 4. Volumetric Divine Light Beams & Aura
  const innerBeamGeom = new THREE.ConeGeometry(0.55, 1.4, 16, 1, true);
  disposables.push(innerBeamGeom);
  const innerBeamMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(innerBeamMat);
  const innerBeam = new THREE.Mesh(innerBeamGeom, innerBeamMat);
  innerBeam.position.set(0, 0.95, 0.02);
  innerBeam.rotation.x = Math.PI;
  chestGroup.add(innerBeam);

  const outerBeamGeom = new THREE.ConeGeometry(0.85, 1.5, 16, 1, true);
  disposables.push(outerBeamGeom);
  const outerBeamMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(outerBeamMat);
  const outerBeam = new THREE.Mesh(outerBeamGeom, outerBeamMat);
  outerBeam.position.set(0, 1.0, 0.02);
  outerBeam.rotation.x = Math.PI;
  chestGroup.add(outerBeam);

  // Rotating Talisman Halo Ring floating above chest
  const talismanRingGeom = new THREE.TorusGeometry(0.38, 0.015, 8, 32);
  disposables.push(talismanRingGeom);
  const talismanRingMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.75,
  });
  disposables.push(talismanRingMat);
  const talismanRing = new THREE.Mesh(talismanRingGeom, talismanRingMat);
  talismanRing.position.set(0, 0.95, 0);
  talismanRing.rotation.x = Math.PI / 2;
  chestGroup.add(talismanRing);

  // Glowing Point Light inside the chest
  const chestLight = new THREE.PointLight(0xf59e0b, 3.8, 4.5);
  chestLight.position.set(0, 0.55, 0);
  chestGroup.add(chestLight);

  return chestGroup;
}

/**
 * Creates a traditional Chinese Stone Lantern Post (石灯笼)
 */
function createStoneLantern(disposables: { dispose: () => void }[]): THREE.Group {
  const lantern = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.6,
    metalness: 0.1,
  });
  disposables.push(stoneMat);

  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });
  disposables.push(paperMat);

  // Base
  const baseG = new THREE.CylinderGeometry(0.14, 0.18, 0.1, 6);
  disposables.push(baseG);
  const base = new THREE.Mesh(baseG, stoneMat);
  base.position.y = 0.05;
  lantern.add(base);

  // Shaft
  const shaftG = new THREE.CylinderGeometry(0.06, 0.07, 0.38, 6);
  disposables.push(shaftG);
  const shaft = new THREE.Mesh(shaftG, stoneMat);
  shaft.position.y = 0.28;
  lantern.add(shaft);

  // Light chamber
  const chamberG = new THREE.CylinderGeometry(0.12, 0.12, 0.16, 6);
  disposables.push(chamberG);
  const chamber = new THREE.Mesh(chamberG, paperMat);
  chamber.position.y = 0.54;
  lantern.add(chamber);

  // Cap roof
  const roofG = new THREE.ConeGeometry(0.2, 0.14, 6);
  disposables.push(roofG);
  const roof = new THREE.Mesh(roofG, stoneMat);
  roof.position.y = 0.68;
  lantern.add(roof);

  // Soft warm light
  const light = new THREE.PointLight(0xfbbf24, 0.6, 2.0);
  light.position.set(0, 0.54, 0);
  lantern.add(light);

  return lantern;
}

/**
 * MythicRealmScene3D
 *
 * Full-scale, responsive 3D WebGL realm architecture:
 * - 4 Authentic Chinese Pagoda Shrines (๔ พระวิหารเก๋งจีนโบราณ) with flying eaves, red lacquer dragon pillars,
 *   warm lanterns, and high-res mythical beast screens.
 * - Central Altar (Daotai) with procedurally generated Bagua Yin-Yang floor texture and celestial astrolabe.
 * - Interactive 3D Imperial Treasure Chest for Act 2 with golden light beam and floating gold Yuanbao.
 * - Dynamic camera swooping to the user's selected realm.
 * - Full responsive canvas sizing with zero empty space.
 */
export const MythicRealmScene3D: React.FC<MythicRealmScene3DProps> = ({
  stage,
  selectedRealm,
  height = 340,
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(stage);
  const selectedRealmRef = useRef(selectedRealm);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    selectedRealmRef.current = selectedRealm;
  }, [selectedRealm]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const disposables: { dispose: () => void }[] = [];

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x190d07, 0.04);

    // --- Camera Setup ---
    const width = container.clientWidth || 390;
    const computedHeight = container.clientHeight || 340;
    const camera = new THREE.PerspectiveCamera(44, width / computedHeight, 0.1, 100);
    // Well-balanced 3/4 high diagonal vantage point
    camera.position.set(4.3, 4.8, 4.3);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, computedHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    disposables.push(renderer);

    // --- Texture Loader ---
    const textureLoader = new THREE.TextureLoader();

    // --- Lighting Architecture ---
    const ambientLight = new THREE.AmbientLight(0xfff1e6, 1.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.3);
    sunLight.position.set(6, 10, 6);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xfbcfe8, 0.85);
    fillLight.position.set(-6, 4, -6);
    scene.add(fillLight);

    const altarPointLight = new THREE.PointLight(0xfbbf24, 3.2, 8);
    altarPointLight.position.set(0, 1.4, 0);
    scene.add(altarPointLight);

    // --- 1. Grand Daotai Celestial Altar (มหาแท่นพิธีฟ้าดินเต๋าไถ) ---
    const daotaiGroup = new THREE.Group();

    // Lowest circular marble terrace
    const terrace1Geom = new THREE.CylinderGeometry(2.35, 2.5, 0.16, 32);
    disposables.push(terrace1Geom);
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f4,
      roughness: 0.35,
      metalness: 0.1,
    });
    disposables.push(marbleMat);
    const terrace1 = new THREE.Mesh(terrace1Geom, marbleMat);
    terrace1.position.y = 0.08;
    daotaiGroup.add(terrace1);

    // Gold rim on terrace 1
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.35,
    });
    disposables.push(goldMat);

    const rim1Geom = new THREE.TorusGeometry(2.38, 0.025, 8, 48);
    disposables.push(rim1Geom);
    const rim1 = new THREE.Mesh(rim1Geom, goldMat);
    rim1.rotation.x = Math.PI / 2;
    rim1.position.y = 0.16;
    daotaiGroup.add(rim1);

    // Upper dais terrace
    const terrace2Geom = new THREE.CylinderGeometry(1.8, 1.9, 0.12, 32);
    disposables.push(terrace2Geom);
    const terrace2 = new THREE.Mesh(terrace2Geom, marbleMat);
    terrace2.position.y = 0.22;
    daotaiGroup.add(terrace2);

    // Procedural Bagua Yin-Yang Floor Plaque
    const baguaTexture = createBaguaFloorTexture();
    disposables.push(baguaTexture);

    const baguaFloorGeom = new THREE.CircleGeometry(1.74, 32);
    disposables.push(baguaFloorGeom);
    const baguaFloorMat = new THREE.MeshStandardMaterial({
      map: baguaTexture,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x451a03,
      emissiveIntensity: 0.25,
    });
    disposables.push(baguaFloorMat);
    const baguaFloor = new THREE.Mesh(baguaFloorGeom, baguaFloorMat);
    baguaFloor.rotation.x = -Math.PI / 2;
    baguaFloor.position.y = 0.285;
    daotaiGroup.add(baguaFloor);

    // Concentric Golden Celestial Astrolabe Rings
    [0.72, 1.15, 1.55].forEach((rad, idx) => {
      const ringGeom = new THREE.TorusGeometry(rad, 0.015, 6, 48);
      disposables.push(ringGeom);
      const ringMesh = new THREE.Mesh(ringGeom, goldMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.29 + idx * 0.005;
      daotaiGroup.add(ringMesh);
    });

    scene.add(daotaiGroup);

    // Four Stone Lanterns on the avenues
    [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach((a) => {
      const lantern = createStoneLantern(disposables);
      lantern.position.set(Math.cos(a) * 2.05, 0.16, Math.sin(a) * 2.05);
      lantern.rotation.y = a + Math.PI;
      scene.add(lantern);
    });

    // --- 2. Central Altar Artifact (浑天仪 & 神龙之心) ---
    const centralArtifactGroup = new THREE.Group();
    scene.add(centralArtifactGroup);

    // Carved Golden Lotus Chalice Base
    const lotusBaseGeom = new THREE.CylinderGeometry(0.32, 0.18, 0.16, 16);
    disposables.push(lotusBaseGeom);
    const lotusBase = new THREE.Mesh(lotusBaseGeom, goldMat);
    lotusBase.position.y = 0.36;
    centralArtifactGroup.add(lotusBase);

    // 8 Golden Lotus Petals
    for (let p = 0; p < 8; p++) {
      const pAngle = (p * Math.PI) / 4;
      const petalGeom = new THREE.ConeGeometry(0.08, 0.22, 6);
      disposables.push(petalGeom);
      const petal = new THREE.Mesh(petalGeom, goldMat);
      petal.position.set(Math.cos(pAngle) * 0.26, 0.44, Math.sin(pAngle) * 0.26);
      petal.rotation.z = Math.PI / 3;
      petal.rotation.y = -pAngle;
      centralArtifactGroup.add(petal);
    }

    // Sacred Heart of the Dragon (神龙金心)
    const heartGeom = new THREE.IcosahedronGeometry(0.32, 1);
    disposables.push(heartGeom);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.95,
      metalness: 0.9,
      roughness: 0.15,
    });
    disposables.push(heartMat);
    const dragonHeart = new THREE.Mesh(heartGeom, heartMat);
    dragonHeart.position.y = 0.72;
    centralArtifactGroup.add(dragonHeart);

    // 3 Interlocking Celestial Armillary Rings (浑天仪)
    const ring1Geom = new THREE.TorusGeometry(0.78, 0.022, 12, 48);
    disposables.push(ring1Geom);
    const ring1 = new THREE.Mesh(ring1Geom, goldMat);
    ring1.position.y = 0.72;
    centralArtifactGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(0.92, 0.022, 12, 48);
    disposables.push(ring2Geom);
    const vermilionRingMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x450a0a,
      emissiveIntensity: 0.3,
    });
    disposables.push(vermilionRingMat);
    const ring2 = new THREE.Mesh(ring2Geom, vermilionRingMat);
    ring2.position.y = 0.72;
    centralArtifactGroup.add(ring2);

    const ring3Geom = new THREE.TorusGeometry(1.05, 0.022, 12, 48);
    disposables.push(ring3Geom);
    const ring3 = new THREE.Mesh(ring3Geom, goldMat);
    ring3.position.y = 0.72;
    centralArtifactGroup.add(ring3);

    // 8 Bagua Marker Beads along outer ring
    for (let b = 0; b < 8; b++) {
      const bAngle = (b * Math.PI) / 4;
      const beadGeom = new THREE.SphereGeometry(0.05, 12, 12);
      disposables.push(beadGeom);
      const bead = new THREE.Mesh(beadGeom, vermilionRingMat);
      bead.position.set(Math.cos(bAngle) * 1.05, 0, Math.sin(bAngle) * 1.05);
      ring3.add(bead);
    }

    // --- 3. Imperial Treasure Chest (Act 2) ---
    const chestAssembly = createImperialChest(disposables);
    chestAssembly.position.set(0, 0.16, 0);
    chestAssembly.visible = false;
    scene.add(chestAssembly);

    // --- 4. Four Authentic Chinese Pagoda Shrines ---
    const shrineGroups: Partial<Record<RealmKey, THREE.Group>> = {};
    const shrineDistance = 3.35; // Distance from center

    (Object.entries(REALM_VISUALS) as [RealmKey, RealmVisualConfig][]).forEach(([key, cfg]) => {
      // Synchronously create Texture handle so it connects immediately
      const artTex = textureLoader.load(cfg.image);
      artTex.colorSpace = THREE.SRGBColorSpace;
      artTex.generateMipmaps = true;
      disposables.push(artTex);

      const pagoda = createPagodaShrine(cfg, artTex, disposables);

      const x = Math.cos(cfg.angle) * shrineDistance;
      const z = Math.sin(cfg.angle) * shrineDistance;
      pagoda.position.set(x, 0, z);

      // Rotate pagoda to face center
      pagoda.rotation.y = -cfg.angle - Math.PI / 2;

      pagoda.userData = { realmKey: key };
      scene.add(pagoda);
      shrineGroups[key] = pagoda;
    });

    // --- 5. Swirling Celestial Stardust & Fireflies ---
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);
    const colArray = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xf59e0b), // Imperial Gold
      new THREE.Color(0x38bdf8), // Azure Cyan
      new THREE.Color(0xfbbf24), // Tiger Amber
      new THREE.Color(0xf472b6), // Fox Pink
      new THREE.Color(0xf87171), // Phoenix Flame
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.6 + Math.random() * 4.2;
      const pAngle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.1) * 2.2;

      posArray[i * 3] = Math.cos(pAngle) * radius;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = Math.sin(pAngle) * radius;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colArray[i * 3] = col.r;
      colArray[i * 3 + 1] = col.g;
      colArray[i * 3 + 2] = col.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    disposables.push(particleGeom);
    particleGeom.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(colArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(particleMat);
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- Touch / Drag Controls ---
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      targetRotY += deltaX * 0.006;
      targetRotX = Math.max(-0.25, Math.min(0.35, targetRotX + deltaY * 0.004));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // --- Dynamic Camera Animation ---
    const cameraTargetPos = new THREE.Vector3(4.3, 4.8, 4.3);
    const cameraLookTarget = new THREE.Vector3(0, 0.4, 0);

    // Auto-pause when offscreen
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    let animationId = 0;
    const clock = new THREE.Clock();

    const animateLoop = () => {
      animationId = requestAnimationFrame(animateLoop);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Stage-dependent artifact visibility & camera targeting
      const curStage = stageRef.current;
      const curRealm = selectedRealmRef.current;

      if (curStage === 2) {
        // Show Mystery Chest in Act 2
        chestAssembly.visible = true;
        centralArtifactGroup.visible = false;
        // Position chest comfortably to face camera
        chestAssembly.rotation.y = Math.PI / 4 + Math.sin(elapsed * 0.5) * 0.08;

        // Camera views the chest prominently and centrally
        cameraTargetPos.set(1.55, 1.25, 1.55);
        cameraLookTarget.set(0, 0.35, 0);
      } else {
        chestAssembly.visible = false;
        centralArtifactGroup.visible = true;

        if (curStage === 1 && curRealm && REALM_VISUALS[curRealm]) {
          // Swoop camera to the selected shrine: stand directly in front facing entrance
          const cfg = REALM_VISUALS[curRealm];
          const x = Math.cos(cfg.angle) * shrineDistance;
          const z = Math.sin(cfg.angle) * shrineDistance;
          const camRatio = 0.5; // Stand halfway between altar and shrine
          cameraTargetPos.set(x * camRatio, 1.3, z * camRatio);
          cameraLookTarget.set(x, 1.15, z);
        } else {
          // Default majestic overview: diagonal 3/4 isometric perspective
          cameraTargetPos.set(4.3, 4.8, 4.3);
          cameraLookTarget.set(0, 0.4, 0);
        }
      }

      // Smooth camera interpolation (Damping / Slerp-like)
      camera.position.lerp(cameraTargetPos, 0.05);

      // Smooth manual drag rotation
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;

      // Apply lookAt with interactive offset
      const lookPos = cameraLookTarget.clone();
      lookPos.x += Math.sin(currentRotY) * 0.5;
      lookPos.z += Math.cos(currentRotY) * 0.5 - 0.5;
      lookPos.y += currentRotX * 0.5;
      camera.lookAt(lookPos);

      // Continuous subtle ambient animations
      if (centralArtifactGroup.visible) {
        dragonHeart.rotation.y = elapsed * 0.5;
        dragonHeart.rotation.x = Math.sin(elapsed * 0.4) * 0.15;
        ring1.rotation.x = elapsed * 0.35;
        ring1.rotation.y = elapsed * 0.25;
        ring2.rotation.y = -elapsed * 0.3;
        ring2.rotation.z = elapsed * 0.2;
        ring3.rotation.z = elapsed * 0.28;
      }

      // Gentle floating particles
      particles.rotation.y = elapsed * 0.025;

      renderer.render(scene, camera);
    };

    animateLoop();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 390;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }

      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {
          // Ignore cleanup errors
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        height,
        touchAction: "none",
        ...style,
      }}
    />
  );
};
