import * as THREE from 'three';

export interface ProceduralTextureSet {
  stuccoMap: THREE.CanvasTexture;
  stuccoBump: THREE.CanvasTexture;
  concreteMap: THREE.CanvasTexture;
  concreteBump: THREE.CanvasTexture;
  paverMap: THREE.CanvasTexture;
  paverBump: THREE.CanvasTexture;
  polishedConcreteMap: THREE.CanvasTexture;
  polishedConcreteRoughness: THREE.CanvasTexture;
  oakMap: THREE.CanvasTexture;
  oakBump: THREE.CanvasTexture;
  calacattaMap: THREE.CanvasTexture;
  calacattaBump: THREE.CanvasTexture;
  slateMap: THREE.CanvasTexture;
  slateBump: THREE.CanvasTexture;
  porcelainTileMap: THREE.CanvasTexture;
  porcelainTileBump: THREE.CanvasTexture;
  boucleMap: THREE.CanvasTexture;
  rugMap: THREE.CanvasTexture;
  grassMap: THREE.CanvasTexture;
  artCanvasMap1: THREE.CanvasTexture;
  artCanvasMap2: THREE.CanvasTexture;
  techIdeScreenMap: THREE.CanvasTexture;
  techDashboardMap: THREE.CanvasTexture;
  brushedMetalRoughness: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  lightPoolMap: THREE.CanvasTexture;
  courtyardGridMap: THREE.CanvasTexture;
  leafMap: THREE.CanvasTexture;
  leafBump: THREE.CanvasTexture;
  barkMap: THREE.CanvasTexture;
  barkBump: THREE.CanvasTexture;
  chineseWoodMap: THREE.CanvasTexture;
  chineseWoodBump: THREE.CanvasTexture;
  asphaltMap: THREE.CanvasTexture;
  asphaltBump: THREE.CanvasTexture;
  dispose: () => void;
}

function seededNoise(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

function makeCanvas(
  width = 512,
  height = width,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return [c, c.getContext('2d')!];
}

export function createProceduralTextureSet(maxAnisotropy: number): ProceduralTextureSet {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 16));
  const rand = seededNoise(4209);
  const createdTextures: THREE.CanvasTexture[] = [];

  const track = (
    canvas: HTMLCanvasElement,
    isColor: boolean,
    rx = 1,
    ry = 1,
  ): THREE.CanvasTexture => {
    const tex = finalizeTexture(canvas, isColor, anisotropy, rx, ry);
    createdTextures.push(tex);
    return tex;
  };

  // 1. Crisp Architectural White Stucco / Plaster
  const [stuccoC, stuccoCtx] = makeCanvas(512);
  const [stuccoBC, stuccoBCtx] = makeCanvas(512);
  stuccoCtx.fillStyle = '#F5F4F0';
  stuccoCtx.fillRect(0, 0, 512, 512);
  stuccoBCtx.fillStyle = '#9C9C9C';
  stuccoBCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3200; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const r = 1 + rand() * 5;
    const delta = Math.round((rand() - 0.5) * 14);
    const v = 242 + delta;
    stuccoCtx.fillStyle = `rgba(${v}, ${v - 1}, ${v - 4}, 0.28)`;
    stuccoCtx.fillRect(x, y, r, r);
    const bv = 148 + delta * 3;
    stuccoBCtx.fillStyle = `rgba(${bv}, ${bv}, ${bv}, 0.35)`;
    stuccoBCtx.fillRect(x, y, r, r);
  }
  const stuccoMap = track(stuccoC, true, 3, 3);
  const stuccoBump = track(stuccoBC, false, 3, 3);

  // 2. Poured Raw Architectural Concrete (Porch, Balcony Surround, Guard House)
  const [concC, concCtx] = makeCanvas(512);
  const [concBC, concBCtx] = makeCanvas(512);
  concCtx.fillStyle = '#B9B7B1';
  concCtx.fillRect(0, 0, 512, 512);
  concBCtx.fillStyle = '#969696';
  concBCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2400; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const w = 2 + rand() * 14;
    const h = 1 + rand() * 5;
    const tone = 165 + Math.round((rand() - 0.5) * 32);
    concCtx.fillStyle = `rgba(${tone}, ${tone - 1}, ${tone - 4}, 0.22)`;
    concCtx.fillRect(x, y, w, h);
    const bt = 135 + Math.round((rand() - 0.5) * 60);
    concBCtx.fillStyle = `rgba(${bt}, ${bt}, ${bt}, 0.32)`;
    concBCtx.fillRect(x, y, w, h);
  }
  // Subtle formwork seam lines
  concCtx.strokeStyle = 'rgba(110, 108, 102, 0.25)';
  concCtx.lineWidth = 1.5;
  concBCtx.strokeStyle = 'rgba(55, 55, 55, 0.45)';
  concBCtx.lineWidth = 2;
  for (let y = 128; y < 512; y += 128) {
    concCtx.beginPath();
    concCtx.moveTo(0, y);
    concCtx.lineTo(512, y);
    concCtx.stroke();
    concBCtx.beginPath();
    concBCtx.moveTo(0, y);
    concBCtx.lineTo(512, y);
    concBCtx.stroke();
  }
  const concreteMap = track(concC, true, 2, 2);
  const concreteBump = track(concBC, false, 2, 2);

  // 3. Interlocking Courtyard Stone Pavers (Driveway & Walkway)
  const [pavC, pavCtx] = makeCanvas(512);
  const [pavBC, pavBCtx] = makeCanvas(512);
  pavCtx.fillStyle = '#73706B';
  pavCtx.fillRect(0, 0, 512, 512);
  pavBCtx.fillStyle = '#383838';
  pavBCtx.fillRect(0, 0, 512, 512);

  const brickW = 64;
  const brickH = 32;
  const rows = 512 / brickH;
  const cols = 512 / brickW;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (brickW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const bx = c * brickW + offset;
      const by = r * brickH;
      const shade = 186 + Math.round((rand() - 0.5) * 26);
      const warm = Math.round((rand() - 0.5) * 8);
      pavCtx.fillStyle = `rgb(${shade + warm}, ${shade}, ${shade - 5})`;
      pavCtx.fillRect(bx + 2, by + 2, brickW - 4, brickH - 4);
      // Stone speckle
      for (let s = 0; s < 6; s++) {
        pavCtx.fillStyle = 'rgba(95, 92, 86, 0.14)';
        pavCtx.fillRect(bx + 4 + rand() * (brickW - 10), by + 4 + rand() * (brickH - 8), 3, 2);
      }
      const bVal = 205 + Math.round((rand() - 0.5) * 20);
      pavBCtx.fillStyle = `rgb(${bVal}, ${bVal}, ${bVal})`;
      pavBCtx.fillRect(bx + 2, by + 2, brickW - 4, brickH - 4);
    }
  }
  const paverMap = track(pavC, true, 7, 14);
  const paverBump = track(pavBC, false, 7, 14);

  // 4. Honed Polished Concrete Interior Floor (Living, Dining, Kitchen, Hall)
  const [polC, polCtx] = makeCanvas(512);
  const [polRC, polRCtx] = makeCanvas(512);
  polCtx.fillStyle = '#ACA9A1';
  polCtx.fillRect(0, 0, 512, 512);
  polRCtx.fillStyle = '#626262';
  polRCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const r = 6 + rand() * 34;
    const t = 158 + Math.round((rand() - 0.5) * 24);
    polCtx.fillStyle = `rgba(${t}, ${t - 2}, ${t - 6}, 0.11)`;
    polCtx.beginPath();
    polCtx.arc(x, y, r, 0, Math.PI * 2);
    polCtx.fill();

    const rt = 78 + Math.round(rand() * 48);
    polRCtx.fillStyle = `rgba(${rt}, ${rt}, ${rt}, 0.25)`;
    polRCtx.beginPath();
    polRCtx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    polRCtx.fill();
  }
  // Subtle large architectural concrete expansion joints
  polCtx.strokeStyle = 'rgba(88, 86, 80, 0.22)';
  polCtx.lineWidth = 1.5;
  for (let p = 256; p <= 512; p += 256) {
    polCtx.beginPath();
    polCtx.moveTo(p, 0);
    polCtx.lineTo(p, 512);
    polCtx.stroke();
    polCtx.beginPath();
    polCtx.moveTo(0, p);
    polCtx.lineTo(512, p);
    polCtx.stroke();
  }
  const polishedConcreteMap = track(polC, true, 4, 4);
  const polishedConcreteRoughness = track(polRC, false, 4, 4);

  // 5. Wide-Plank European White Oak (Bedrooms, Stair Treads, Kitchen Upper Cabinets)
  const [oakC, oakCtx] = makeCanvas(512);
  const [oakBC, oakBCtx] = makeCanvas(512);
  const plankCount = 8;
  const plankH = 512 / plankCount;
  for (let p = 0; p < plankCount; p++) {
    const y0 = p * plankH;
    const base = 186 + Math.round((rand() - 0.5) * 20);
    oakCtx.fillStyle = `rgb(${base}, ${base - 30}, ${base - 64})`;
    oakCtx.fillRect(0, y0, 512, plankH);

    oakBCtx.fillStyle = '#B8B8B8';
    oakBCtx.fillRect(0, y0, 512, plankH);

    for (let g = 0; g < 26; g++) {
      const gy = y0 + rand() * plankH;
      oakCtx.strokeStyle = `rgba(116, 82, 48, ${0.1 + rand() * 0.16})`;
      oakCtx.lineWidth = 0.8 + rand() * 1.5;
      oakCtx.beginPath();
      oakCtx.moveTo(0, gy);
      oakCtx.bezierCurveTo(170, gy + (rand() - 0.5) * 7, 340, gy + (rand() - 0.5) * 7, 512, gy);
      oakCtx.stroke();

      oakBCtx.strokeStyle = 'rgba(82, 82, 82, 0.25)';
      oakBCtx.lineWidth = 1;
      oakBCtx.beginPath();
      oakBCtx.moveTo(0, gy);
      oakBCtx.lineTo(512, gy);
      oakBCtx.stroke();
    }

    // Staggered vertical plank end joint
    const endX = ((p * 197 + 90) % 420) + 45;
    oakCtx.fillStyle = 'rgba(84, 62, 42, 0.45)';
    oakCtx.fillRect(0, y0, 512, 1.8);
    oakCtx.fillRect(endX, y0, 1.8, plankH);
    oakBCtx.fillStyle = '#363636';
    oakBCtx.fillRect(0, y0, 512, 2);
    oakBCtx.fillRect(endX, y0, 2, plankH);
  }
  const oakMap = track(oakC, true, 3, 3);
  const oakBump = track(oakBC, false, 3, 3);

  // 6. Veined Calacatta White Marble (Kitchen Island, Countertops, Backsplash & Vanity Top)
  const [calC, calCtx] = makeCanvas(512);
  const [calBC, calBCtx] = makeCanvas(512);
  calCtx.fillStyle = '#F3F2EE';
  calCtx.fillRect(0, 0, 512, 512);
  calBCtx.fillStyle = '#CCCCCC';
  calBCtx.fillRect(0, 0, 512, 512);

  // Soft cloudy stone patches
  for (let i = 0; i < 40; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const r = 24 + rand() * 68;
    calCtx.fillStyle = 'rgba(218, 214, 206, 0.16)';
    calCtx.beginPath();
    calCtx.arc(x, y, r, 0, Math.PI * 2);
    calCtx.fill();
  }
  // Dramatic branching mineral veins
  for (let v = 0; v < 16; v++) {
    let vx = rand() * 512;
    let vy = rand() * 512;
    const angleBase = (rand() - 0.5) * 0.7 + 0.55;
    calCtx.strokeStyle = v % 3 === 0 ? 'rgba(132, 126, 118, 0.42)' : 'rgba(92, 92, 90, 0.55)';
    calCtx.lineWidth = 1.2 + rand() * 2.8;
    calCtx.beginPath();
    calCtx.moveTo(vx, vy);

    calBCtx.strokeStyle = 'rgba(140, 140, 140, 0.5)';
    calBCtx.lineWidth = calCtx.lineWidth;
    calBCtx.beginPath();
    calBCtx.moveTo(vx, vy);

    for (let step = 0; step < 12; step++) {
      vx += Math.cos(angleBase + (rand() - 0.5) * 0.9) * 32;
      vy += Math.sin(angleBase + (rand() - 0.5) * 0.9) * 32;
      calCtx.lineTo(vx, vy);
      calBCtx.lineTo(vx, vy);
    }
    calCtx.stroke();
    calBCtx.stroke();
  }
  const calacattaMap = track(calC, true, 2, 2);
  const calacattaBump = track(calBC, false, 2, 2);

  // 7. Dark Charcoal Veined Slate / Stone (Walk-In Shower Feature Walls)
  const [slateC, slateCtx] = makeCanvas(512);
  const [slateBC, slateBCtx] = makeCanvas(512);
  slateCtx.fillStyle = '#4B4E4F';
  slateCtx.fillRect(0, 0, 512, 512);
  slateBCtx.fillStyle = '#A0A0A0';
  slateBCtx.fillRect(0, 0, 512, 512);
  for (let v = 0; v < 18; v++) {
    let sx = rand() * 512;
    let sy = rand() * 512;
    slateCtx.strokeStyle = v % 2 === 0 ? 'rgba(195, 198, 196, 0.28)' : 'rgba(42, 44, 45, 0.45)';
    slateCtx.lineWidth = 1 + rand() * 3.5;
    slateCtx.beginPath();
    slateCtx.moveTo(sx, sy);
    for (let k = 0; k < 10; k++) {
      sx += 28 + (rand() - 0.5) * 20;
      sy += (rand() - 0.35) * 38;
      slateCtx.lineTo(sx, sy);
    }
    slateCtx.stroke();
  }
  // Large rectified shower tile joints
  slateCtx.strokeStyle = 'rgba(28, 30, 31, 0.55)';
  slateCtx.lineWidth = 2;
  slateBCtx.strokeStyle = '#383838';
  slateBCtx.lineWidth = 3;
  for (let y = 0; y <= 512; y += 170) {
    slateCtx.beginPath();
    slateCtx.moveTo(0, y);
    slateCtx.lineTo(512, y);
    slateCtx.stroke();
    slateBCtx.beginPath();
    slateBCtx.moveTo(0, y);
    slateBCtx.lineTo(512, y);
    slateBCtx.stroke();
  }
  const slateMap = track(slateC, true, 2, 2);
  const slateBump = track(slateBC, false, 2, 2);

  // 8. Large-Format Warm Grey Bathroom Porcelain Tile
  const [tileC, tileCtx] = makeCanvas(512);
  const [tileBC, tileBCtx] = makeCanvas(512);
  tileCtx.fillStyle = '#D2CFC8';
  tileCtx.fillRect(0, 0, 512, 512);
  tileBCtx.fillStyle = '#C4C4C4';
  tileBCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 600; i++) {
    const shade = 198 + Math.round((rand() - 0.5) * 16);
    tileCtx.fillStyle = `rgba(${shade}, ${shade - 2}, ${shade - 6}, 0.18)`;
    tileCtx.fillRect(rand() * 512, rand() * 512, 8 + rand() * 20, 4 + rand() * 14);
  }
  tileCtx.strokeStyle = 'rgba(130, 128, 122, 0.45)';
  tileCtx.lineWidth = 2;
  tileBCtx.strokeStyle = '#404040';
  tileBCtx.lineWidth = 2.5;
  for (let i = 0; i <= 512; i += 128) {
    tileCtx.beginPath();
    tileCtx.moveTo(i, 0);
    tileCtx.lineTo(i, 512);
    tileCtx.stroke();
    tileCtx.beginPath();
    tileCtx.moveTo(0, i);
    tileCtx.lineTo(512, i);
    tileCtx.stroke();

    tileBCtx.beginPath();
    tileBCtx.moveTo(i, 0);
    tileBCtx.lineTo(i, 512);
    tileBCtx.stroke();
    tileBCtx.beginPath();
    tileBCtx.moveTo(0, i);
    tileBCtx.lineTo(512, i);
    tileBCtx.stroke();
  }
  const porcelainTileMap = track(tileC, true, 3, 3);
  const porcelainTileBump = track(tileBC, false, 3, 3);

  // 9. Tactile Woven Bouclé Fabric (Sofa, Chairs, Headboard, Bedding)
  const [bouC, bouCtx] = makeCanvas(256);
  bouCtx.fillStyle = '#DFDBD2';
  bouCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    for (let x = 0; x < 256; x += 3) {
      const n = 205 + Math.round((rand() - 0.5) * 38);
      bouCtx.fillStyle = `rgb(${n}, ${n - 4}, ${n - 10})`;
      bouCtx.fillRect(x, y, 2, 2);
    }
  }
  const boucleMap = track(bouC, true, 4, 4);

  // 10. Speckled Tufted Area Rug Weave
  const [rugC, rugCtx] = makeCanvas(256);
  rugCtx.fillStyle = '#DBD7CE';
  rugCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2800; i++) {
    const shade = rand() > 0.72 ? 120 + Math.round(rand() * 50) : 205 + Math.round(rand() * 35);
    rugCtx.fillStyle = `rgba(${shade}, ${shade - 3}, ${shade - 7}, 0.55)`;
    rugCtx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 4, 2);
  }
  const rugMap = track(rugC, true, 4, 4);

  // 11. Manicured Front-Left Garden Lawn Turf
  const [grassC, grassCtx] = makeCanvas(256);
  grassCtx.fillStyle = '#4B782C';
  grassCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const g = 98 + Math.round((rand() - 0.5) * 44);
    grassCtx.fillStyle = `rgba(${Math.round(g * 0.58)}, ${g}, ${Math.round(g * 0.34)}, 0.5)`;
    grassCtx.fillRect(rand() * 256, rand() * 256, 2, 4 + rand() * 4);
  }
  const grassMap = track(grassC, true, 4, 4);

  // 12. Minimalist Abstract Framed Wall Artworks
  const [art1C, art1Ctx] = makeCanvas(256);
  art1Ctx.fillStyle = '#F2F0EB';
  art1Ctx.fillRect(0, 0, 256, 256);
  art1Ctx.fillStyle = '#D9D3C8';
  art1Ctx.fillRect(28, 34, 200, 188);
  art1Ctx.fillStyle = '#383733';
  art1Ctx.beginPath();
  art1Ctx.arc(118, 128, 52, 0.2, Math.PI * 1.45);
  art1Ctx.fill();
  art1Ctx.fillStyle = '#A6957E';
  art1Ctx.fillRect(130, 82, 62, 92);
  const artCanvasMap1 = track(art1C, true, 1, 1);

  const [art2C, art2Ctx] = makeCanvas(256);
  art2Ctx.fillStyle = '#EFECE6';
  art2Ctx.fillRect(0, 0, 256, 256);
  art2Ctx.fillStyle = '#C9C2B6';
  art2Ctx.fillRect(36, 42, 184, 172);
  art2Ctx.strokeStyle = '#2B2B28';
  art2Ctx.lineWidth = 10;
  art2Ctx.beginPath();
  art2Ctx.moveTo(64, 180);
  art2Ctx.bezierCurveTo(96, 95, 165, 155, 192, 74);
  art2Ctx.stroke();
  const artCanvasMap2 = track(art2C, true, 1, 1);

  // 12b. Tech Study Monitor Displays (Dark-mode IDE Code Editor + Telemetry Dashboard)
  const [ideC, ideCtx] = makeCanvas(512, 256);
  ideCtx.fillStyle = '#0D1321';
  ideCtx.fillRect(0, 0, 512, 256);
  // Left file explorer sidebar
  ideCtx.fillStyle = '#131C2E';
  ideCtx.fillRect(0, 0, 92, 256);
  ideCtx.fillStyle = '#1D2940';
  ideCtx.fillRect(92, 0, 420, 22);
  // Tab indicators
  ideCtx.fillStyle = '#38BDF8';
  ideCtx.fillRect(102, 19, 64, 3);
  ideCtx.fillStyle = '#64748B';
  for (let i = 0; i < 11; i++) {
    ideCtx.fillStyle = i === 2 ? '#38BDF8' : '#475569';
    ideCtx.fillRect(14, 28 + i * 18, 42 + ((i * 19) % 30), 6);
  }
  // Syntax-highlighted code lines
  const codePalette = ['#38BDF8', '#A78BFA', '#34D399', '#FBBF24', '#E2E8F0', '#F472B6'];
  for (let row = 0; row < 14; row++) {
    const y = 34 + row * 11;
    const indent = (row % 3) * 14;
    let x = 108 + indent;
    const tokens = 2 + (row % 4);
    for (let t = 0; t < tokens; t++) {
      const w = 18 + Math.round(rand() * 52);
      ideCtx.fillStyle = codePalette[(row + t) % codePalette.length];
      ideCtx.fillRect(x, y, Math.min(w, 495 - x), 5);
      x += w + 7;
      if (x > 475) break;
    }
  }
  // Bottom integrated terminal panel
  ideCtx.fillStyle = '#090E18';
  ideCtx.fillRect(92, 192, 420, 64);
  ideCtx.fillStyle = '#22C55E';
  ideCtx.fillRect(106, 206, 82, 6);
  ideCtx.fillStyle = '#38BDF8';
  ideCtx.fillRect(106, 220, 148, 5);
  ideCtx.fillStyle = '#94A3B8';
  ideCtx.fillRect(106, 232, 210, 5);
  const techIdeScreenMap = track(ideC, true, 1, 1);

  const [dashC, dashCtx] = makeCanvas(256, 256);
  dashCtx.fillStyle = '#0B1120';
  dashCtx.fillRect(0, 0, 256, 256);
  // Header bar + cards
  dashCtx.fillStyle = '#152038';
  dashCtx.fillRect(10, 10, 236, 22);
  dashCtx.fillRect(10, 42, 112, 92);
  dashCtx.fillRect(134, 42, 112, 92);
  dashCtx.fillRect(10, 144, 236, 100);
  // Live telemetry bar & spline graph
  for (let b = 0; b < 8; b++) {
    const bh = 18 + Math.round(rand() * 48);
    dashCtx.fillStyle = b % 2 === 0 ? '#22D3EE' : '#818CF8';
    dashCtx.fillRect(20 + b * 12, 124 - bh, 7, bh);
  }
  // Circular ring gauge in top-right card
  dashCtx.strokeStyle = '#38BDF8';
  dashCtx.lineWidth = 6;
  dashCtx.beginPath();
  dashCtx.arc(190, 88, 28, -Math.PI * 0.6, Math.PI * 1.15);
  dashCtx.stroke();
  // Bottom waveform line
  dashCtx.strokeStyle = '#34D399';
  dashCtx.lineWidth = 2.5;
  dashCtx.beginPath();
  for (let gx = 20; gx <= 236; gx += 12) {
    const gy = 196 + Math.sin(gx * 0.08) * 22 + (rand() - 0.5) * 14;
    if (gx === 20) dashCtx.moveTo(gx, gy);
    else dashCtx.lineTo(gx, gy);
  }
  dashCtx.stroke();
  const techDashboardMap = track(dashC, true, 1, 1);

  // 13. Brushed Metal Roughness Map
  const [metC, metCtx] = makeCanvas(256);
  metCtx.fillStyle = '#686868';
  metCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    const shade = 75 + Math.round(rand() * 80);
    metCtx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    metCtx.fillRect(0, y, 256, 1);
  }
  const brushedMetalRoughness = track(metC, false, 2, 2);

  // 14. Radial Contact Shadow Disc
  const [shadC, shadCtx] = makeCanvas(256);
  const grad = shadCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
  grad.addColorStop(0, 'rgba(13, 13, 12, 0.85)');
  grad.addColorStop(0.55, 'rgba(13, 13, 12, 0.35)');
  grad.addColorStop(1, 'rgba(13, 13, 12, 0.0)');
  shadCtx.fillStyle = grad;
  shadCtx.fillRect(0, 0, 256, 256);
  const contactShadowMap = track(shadC, true, 1, 1);

  // 14b. Soft Radial Warm Light Pool (Streetlamps, Tree Uplights & Sconces)
  const [poolC, poolCtx] = makeCanvas(256);
  const poolGrad = poolCtx.createRadialGradient(128, 128, 4, 128, 128, 124);
  poolGrad.addColorStop(0, 'rgba(255, 240, 205, 0.95)');
  poolGrad.addColorStop(0.35, 'rgba(255, 214, 145, 0.55)');
  poolGrad.addColorStop(0.7, 'rgba(255, 192, 108, 0.18)');
  poolGrad.addColorStop(1, 'rgba(255, 180, 90, 0.0)');
  poolCtx.fillStyle = poolGrad;
  poolCtx.fillRect(0, 0, 256, 256);
  const lightPoolMap = track(poolC, true, 1, 1);

  // 15. Surround Exterior Architectural Ground Grid
  const [gridC, gridCtx] = makeCanvas(512);
  gridCtx.fillStyle = '#ECEAE4';
  gridCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 650; i++) {
    gridCtx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(156,150,142,0.14)';
    gridCtx.fillRect(rand() * 512, rand() * 512, 3 + rand() * 6, 3 + rand() * 6);
  }
  gridCtx.strokeStyle = 'rgba(120, 118, 112, 0.16)';
  gridCtx.lineWidth = 1.5;
  for (let i = 0; i <= 512; i += 128) {
    gridCtx.beginPath();
    gridCtx.moveTo(i, 0);
    gridCtx.lineTo(i, 512);
    gridCtx.stroke();
    gridCtx.beginPath();
    gridCtx.moveTo(0, i);
    gridCtx.lineTo(512, i);
    gridCtx.stroke();
  }
  const courtyardGridMap = track(gridC, true, 18, 18);

  // 16. Botanical Leaf Albedo & Vein Relief (Ficus / Fiddle-Leaf)
  const [leafC, leafCtx] = makeCanvas(256);
  const [leafBC, leafBCtx] = makeCanvas(256);
  const leafGrad = leafCtx.createLinearGradient(0, 256, 0, 0);
  leafGrad.addColorStop(0, '#2C511F');
  leafGrad.addColorStop(0.55, '#3D6A29');
  leafGrad.addColorStop(1, '#528035');
  leafCtx.fillStyle = leafGrad;
  leafCtx.fillRect(0, 0, 256, 256);
  leafBCtx.fillStyle = '#7E7E7E';
  leafBCtx.fillRect(0, 0, 256, 256);

  // Subtle margin sunlit edge highlight & cellular speckle
  for (let i = 0; i < 650; i++) {
    const lx = rand() * 256;
    const ly = rand() * 256;
    leafCtx.fillStyle = rand() > 0.5 ? 'rgba(130, 175, 85, 0.10)' : 'rgba(28, 52, 20, 0.14)';
    leafCtx.fillRect(lx, ly, 2 + rand() * 4, 2 + rand() * 4);
  }

  // Central midrib vein (x = 128)
  leafCtx.strokeStyle = '#7AA053';
  leafCtx.lineWidth = 4.2;
  leafCtx.beginPath();
  leafCtx.moveTo(128, 256);
  leafCtx.lineTo(128, 12);
  leafCtx.stroke();

  leafBCtx.strokeStyle = '#D4D4D4';
  leafBCtx.lineWidth = 4.5;
  leafBCtx.beginPath();
  leafBCtx.moveTo(128, 256);
  leafBCtx.lineTo(128, 12);
  leafBCtx.stroke();

  // Pinnate branching lateral veins
  for (let v = 0; v < 7; v++) {
    const startY = 225 - v * 28;
    const endY = startY - 34;
    const w = 1.1 + (6 - v) * 0.25;
    [-1, 1].forEach((side) => {
      leafCtx.strokeStyle = 'rgba(138, 178, 92, 0.62)';
      leafCtx.lineWidth = w;
      leafCtx.beginPath();
      leafCtx.moveTo(128, startY);
      leafCtx.quadraticCurveTo(128 + side * 46, startY - 10, 128 + side * 112, endY);
      leafCtx.stroke();

      leafBCtx.strokeStyle = 'rgba(205, 205, 205, 0.55)';
      leafBCtx.lineWidth = w;
      leafBCtx.beginPath();
      leafBCtx.moveTo(128, startY);
      leafBCtx.quadraticCurveTo(128 + side * 46, startY - 10, 128 + side * 112, endY);
      leafBCtx.stroke();
    });
  }
  const leafMap = track(leafC, true, 1, 1);
  const leafBump = track(leafBC, false, 1, 1);

  // 17. Striated Organic Tree Bark
  const [barkC, barkCtx] = makeCanvas(256);
  const [barkBC, barkBCtx] = makeCanvas(256);
  barkCtx.fillStyle = '#6A5B4C';
  barkCtx.fillRect(0, 0, 256, 256);
  barkBCtx.fillStyle = '#808080';
  barkBCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) {
    const bx = rand() * 256;
    const by = rand() * 256;
    const bh = 16 + rand() * 48;
    const bw = 1 + rand() * 3.5;
    const shade = Math.round((rand() - 0.5) * 34);
    barkCtx.fillStyle = `rgb(${102 + shade}, ${88 + shade}, ${74 + shade})`;
    barkCtx.fillRect(bx, by, bw, bh);
    const bShade = 128 + shade * 2;
    barkBCtx.fillStyle = `rgb(${bShade}, ${bShade}, ${bShade})`;
    barkBCtx.fillRect(bx, by, bw, bh);
  }
  const barkMap = track(barkC, true, 1, 2);
  const barkBump = track(barkBC, false, 1, 2);

  // 18. Rich Chinese Rosewood / Chestnut Architectural Door Timber
  const [cwC, cwCtx] = makeCanvas(256);
  const [cwBC, cwBCtx] = makeCanvas(256);
  const cwGrad = cwCtx.createLinearGradient(0, 0, 256, 0);
  cwGrad.addColorStop(0, '#6B361E');
  cwGrad.addColorStop(0.5, '#783E23');
  cwGrad.addColorStop(1, '#63311B');
  cwCtx.fillStyle = cwGrad;
  cwCtx.fillRect(0, 0, 256, 256);
  cwBCtx.fillStyle = '#929292';
  cwBCtx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 160; i++) {
    const gx = rand() * 256;
    const tone = rand() > 0.4 ? 'rgba(54, 24, 12, 0.24)' : 'rgba(148, 86, 50, 0.16)';
    cwCtx.strokeStyle = tone;
    cwCtx.lineWidth = 0.8 + rand() * 1.8;
    cwCtx.beginPath();
    cwCtx.moveTo(gx, 0);
    cwCtx.bezierCurveTo(
      gx + (rand() - 0.5) * 12,
      85,
      gx + (rand() - 0.5) * 12,
      170,
      gx + (rand() - 0.5) * 6,
      256,
    );
    cwCtx.stroke();

    cwBCtx.strokeStyle = 'rgba(65, 65, 65, 0.28)';
    cwBCtx.lineWidth = 1;
    cwBCtx.beginPath();
    cwBCtx.moveTo(gx, 0);
    cwBCtx.lineTo(gx, 256);
    cwBCtx.stroke();
  }
  const chineseWoodMap = track(cwC, true, 1, 1);
  const chineseWoodBump = track(cwBC, false, 1, 1);

  // 19. Fine-Aggregate Architectural Asphalt Street Surface
  const [aspC, aspCtx] = makeCanvas(512);
  const [aspBC, aspBCtx] = makeCanvas(512);
  aspCtx.fillStyle = '#33363A';
  aspCtx.fillRect(0, 0, 512, 512);
  aspBCtx.fillStyle = '#7E7E7E';
  aspBCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6500; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const sz = 1 + rand() * 2.4;
    const tone = 42 + Math.round(rand() * 28);
    aspCtx.fillStyle = `rgb(${tone}, ${tone + 2}, ${tone + 5})`;
    aspCtx.fillRect(x, y, sz, sz);
    const bt = 96 + Math.round((rand() - 0.5) * 90);
    aspBCtx.fillStyle = `rgb(${bt}, ${bt}, ${bt})`;
    aspBCtx.fillRect(x, y, sz, sz);
  }
  const asphaltMap = track(aspC, true, 8, 3);
  const asphaltBump = track(aspBC, false, 8, 3);

  return {
    stuccoMap,
    stuccoBump,
    concreteMap,
    concreteBump,
    paverMap,
    paverBump,
    polishedConcreteMap,
    polishedConcreteRoughness,
    oakMap,
    oakBump,
    calacattaMap,
    calacattaBump,
    slateMap,
    slateBump,
    porcelainTileMap,
    porcelainTileBump,
    boucleMap,
    rugMap,
    grassMap,
    artCanvasMap1,
    artCanvasMap2,
    techIdeScreenMap,
    techDashboardMap,
    brushedMetalRoughness,
    contactShadowMap,
    lightPoolMap,
    courtyardGridMap,
    leafMap,
    leafBump,
    barkMap,
    barkBump,
    chineseWoodMap,
    chineseWoodBump,
    asphaltMap,
    asphaltBump,
    dispose: () => {
      createdTextures.forEach((t) => t.dispose());
    },
  };
}
