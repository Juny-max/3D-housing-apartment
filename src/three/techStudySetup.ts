import * as THREE from 'three';
import { FurnishingMaterials, TrackGeoFn, createBeveledBox } from './interiorFurnishings';

/**
 * Builds a complete multi-part developer / creator triple-monitor workstation,
 * backlit acoustic slat feature wall, tempered-glass RGB PC tower, studio audio gear,
 * and ergonomic high-back mesh task chair.
 * Local origin sits on floor (y=0) under desk center facing -Z (screens face +Z into room).
 */
export function buildTechStudyWorkstation(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const g = new THREE.Group();

  // -------------------------------------------------------
  // 1. ACOUSTIC SLAT FEATURE WALL + LED BACKLIGHT + FLOATING TECH SHELVES (z = -0.57)
  // -------------------------------------------------------
  const slatWall = new THREE.Group();
  slatWall.position.set(0, 0, -0.57);

  const acousticFelt = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.56, 2.38, 0.024)),
    mats.charcoalMatte,
  );
  acousticFelt.position.set(0, 1.24, 0);
  slatWall.add(acousticFelt);

  const slatGeo = trackGeo(new THREE.BoxGeometry(0.045, 2.34, 0.026));
  const slatCount = 22;
  for (let i = 0; i < slatCount; i++) {
    const sx = -1.2 + (i / (slatCount - 1)) * 2.4;
    const slat = new THREE.Mesh(slatGeo, mats.walnut);
    slat.position.set(sx, 1.24, 0.02);
    slatWall.add(slat);
  }

  // Subtle top & bottom perimeter LED strip halo
  const haloTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.44, 0.016, 0.014)),
    mats.rgbCyanGlow,
  );
  haloTop.position.set(0, 2.41, 0.02);
  slatWall.add(haloTop);

  const haloMid = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 0.018, 0.014)),
    mats.rgbVioletGlow,
  );
  haloMid.position.set(0, 0.78, 0.025);
  slatWall.add(haloMid);

  // Floating Walnut Tech Display Shelves above monitors
  [1.72, 2.12].forEach((sy, idx) => {
    const shelf = new THREE.Mesh(
      trackGeo(createBeveledBox(1.92, 0.22, 0.036, 0.008)),
      mats.oak,
    );
    shelf.position.set(0, sy, 0.12);
    slatWall.add(shelf);

    // Subtle under-shelf warm LED strip
    const sLed = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.78, 0.01, 0.012)),
      mats.warmBulbGlow,
    );
    sLed.position.set(0, sy - 0.004, 0.05);
    slatWall.add(sLed);

    if (idx === 0) {
      // Lower shelf: mini tabletop cube synth, coiled studio headphones case, stacked tech books
      const synthBox = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.32, 0.075, 0.15)),
        mats.matteBlackMetal,
      );
      synthBox.position.set(-0.62, sy + 0.073, 0.12);
      slatWall.add(synthBox);

      const ledBtn = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.2, 0.012, 0.04)),
        mats.rgbCyanGlow,
      );
      ledBtn.position.set(-0.62, sy + 0.112, 0.13);
      slatWall.add(ledBtn);

      [0.24, 0.31, 0.38, 0.45].forEach((bx, bi) => {
        const book = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.042, 0.22 + (bi % 2) * 0.04, 0.16)),
          bi % 2 === 0 ? mats.charcoalMatte : mats.taupePaint,
        );
        book.position.set(bx, sy + 0.145, 0.12);
        slatWall.add(book);
      });
    } else {
      // Upper shelf: collectible architectural model & storage organizer boxes
      const boxL = new THREE.Mesh(
        trackGeo(createBeveledBox(0.34, 0.17, 0.16, 0.01)),
        mats.charcoalMatte,
      );
      boxL.position.set(-0.58, sy + 0.036, 0.12);
      slatWall.add(boxL);

      const sculpture = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.06, 0.075, 0.24, 14)),
        mats.brushedChrome,
      );
      sculpture.position.set(0.08, sy + 0.155, 0.12);
      slatWall.add(sculpture);

      const pot = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.075, 0.06, 0.13, 12)),
        mats.whiteCeramic,
      );
      pot.position.set(0.66, sy + 0.1, 0.12);
      slatWall.add(pot);

      const miniLeaf = new THREE.Mesh(
        trackGeo(new THREE.DodecahedronGeometry(0.1, 1)),
        mats.foliageGreen,
      );
      miniLeaf.position.set(0.66, sy + 0.21, 0.12);
      slatWall.add(miniLeaf);
    }
  });

  g.add(slatWall);

  // -------------------------------------------------------
  // 2. MOTORIZED DUAL-COLUMN STANDING DESK (2.28m x 0.80m, y=0.75)
  // -------------------------------------------------------
  const deskGroup = new THREE.Group();
  const deskTop = new THREE.Mesh(
    trackGeo(createBeveledBox(2.28, 0.8, 0.052, 0.01)),
    mats.walnut,
  );
  deskTop.position.set(0, 0.705, 0);
  deskTop.castShadow = !isSoftwareGl;
  deskTop.receiveShadow = !isSoftwareGl;
  deskGroup.add(deskTop);

  // Motorized T-Legs + Feet + Crossbar + Cable Raceway
  [-0.94, 0.94].forEach((lx) => {
    const column = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.08, 0.68, 0.11)),
      mats.matteBlackMetal,
    );
    column.position.set(lx, 0.36, -0.04);
    deskGroup.add(column);

    const foot = new THREE.Mesh(
      trackGeo(createBeveledBox(0.085, 0.68, 0.04, 0.008)),
      mats.matteBlackMetal,
    );
    foot.position.set(lx, 0.0, 0);
    deskGroup.add(foot);
  });

  const crossbar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.86, 0.05, 0.06)),
    mats.matteBlackMetal,
  );
  crossbar.position.set(0, 0.66, -0.14);
  deskGroup.add(crossbar);

  const cableTray = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.48, 0.08, 0.12)),
    mats.charcoalMatte,
  );
  cableTray.position.set(0, 0.62, -0.28);
  deskGroup.add(cableTray);

  const underDeskLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.014, 0.016)),
    mats.rgbCyanGlow,
  );
  underDeskLed.position.set(0, 0.705, -0.39);
  deskGroup.add(underDeskLed);

  g.add(deskGroup);

  // -------------------------------------------------------
  // 3. TRIPLE MONITOR ARRAY ON ARTICULATING VESA ARM
  // -------------------------------------------------------
  const armPole = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 12)),
    mats.matteBlackMetal,
  );
  armPole.position.set(-0.04, 1.0, -0.33);
  g.add(armPole);

  const armBaseClamp = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.11, 0.06, 0.1)),
    mats.matteBlackMetal,
  );
  armBaseClamp.position.set(-0.04, 0.76, -0.35);
  g.add(armBaseClamp);

  const buildMonitorPanel = (
    w: number,
    h: number,
    screenMat: THREE.Material,
    withLightBar = false,
  ): THREE.Group => {
    const mon = new THREE.Group();
    mon.name = 'monitor-panel';
    mon.userData = { panelW: w, panelH: h };
    const housing = new THREE.Mesh(
      trackGeo(createBeveledBox(w, 0.032, h, 0.008)),
      mats.matteBlackMetal,
    );
    housing.position.set(0, -h * 0.5, 0);
    housing.castShadow = !isSoftwareGl;
    mon.add(housing);

    const screen = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(w - 0.028, h - 0.028)),
      screenMat,
    );
    screen.position.set(0, 0, 0.017);
    mon.add(screen);

    // Rear VESA bracket + arm link
    const vesa = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.11, 0.03)),
      mats.charcoalMatte,
    );
    vesa.position.set(0, 0, -0.026);
    mon.add(vesa);

    if (withLightBar) {
      const barBody = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.012, 0.012, w * 0.62, 10)),
        mats.matteBlackMetal,
      );
      barBody.rotation.z = Math.PI / 2;
      barBody.position.set(0, h * 0.5 + 0.018, 0.035);
      mon.add(barBody);

      const barLed = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(w * 0.58, 0.008, 0.014)),
        mats.warmBulbGlow,
      );
      barLed.position.set(0, h * 0.5 + 0.008, 0.036);
      mon.add(barLed);
    }

    return mon;
  };

  // Horizontal articulating boom behind monitors
  const vesaArmL = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.68, 0.028, 0.03)),
    mats.matteBlackMetal,
  );
  vesaArmL.position.set(-0.38, 1.07, -0.25);
  vesaArmL.rotation.y = -0.26;
  g.add(vesaArmL);

  const vesaArmR = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.62, 0.028, 0.03)),
    mats.matteBlackMetal,
  );
  vesaArmR.position.set(0.28, 1.07, -0.25);
  vesaArmR.rotation.y = 0.26;
  g.add(vesaArmR);

  // Monitor 1: Center 34" Ultrawide Primary IDE Display
  const centerMonitor = buildMonitorPanel(0.84, 0.37, mats.techScreenCenter, true);
  centerMonitor.position.set(-0.04, 1.08, -0.2);
  g.add(centerMonitor);

  // Monitor 2: Left 27" Telemetry / System Dashboard (angled +25 deg inward)
  const leftMonitor = buildMonitorPanel(0.56, 0.34, mats.techScreenSide);
  leftMonitor.position.set(-0.71, 1.08, -0.08);
  leftMonitor.rotation.y = 0.44;
  g.add(leftMonitor);

  // Monitor 3: Right 27" Vertical Portrait Terminal / Code Display (angled -25 deg inward)
  const rightMonitor = buildMonitorPanel(0.35, 0.56, mats.techScreenCenter);
  rightMonitor.position.set(0.56, 1.13, -0.09);
  rightMonitor.rotation.y = -0.44;
  g.add(rightMonitor);

  // -------------------------------------------------------
  // 4. TEMPERED-GLASS RGB WORKSTATION PC TOWER (x = +0.94)
  // -------------------------------------------------------
  const pcTower = new THREE.Group();
  pcTower.position.set(0.95, 0.755, -0.02);
  pcTower.rotation.y = -0.14; // Slightly angled so tempered glass interior faces room cleanly

  const pcCase = new THREE.Mesh(
    trackGeo(createBeveledBox(0.22, 0.44, 0.46, 0.01)),
    mats.matteBlackMetal,
  );
  pcCase.position.set(0, 0, 0);
  pcCase.castShadow = !isSoftwareGl;
  pcTower.add(pcCase);

  // Tempered glass left window (-X side) + glowing internal GPU, AIO block, & RAM
  const glassSide = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.012, 0.38, 0.36)),
    mats.smokedGlass,
  );
  glassSide.position.set(-0.112, 0.23, 0.01);
  glassSide.renderOrder = 3;
  pcTower.add(glassSide);

  const moboGlow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.018, 0.055, 0.24)),
    mats.rgbCyanGlow,
  );
  moboGlow.position.set(-0.085, 0.19, 0.02);
  pcTower.add(moboGlow); // GPU illuminated edge

  const aioBlock = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.038, 0.038, 0.025, 16)),
    mats.rgbVioletGlow,
  );
  aioBlock.rotation.z = Math.PI / 2;
  aioBlock.position.set(-0.085, 0.31, -0.03);
  pcTower.add(aioBlock);

  [0.03, 0.055].forEach((rz) => {
    const ramStick = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.014, 0.095, 0.012)),
      mats.rgbCyanGlow,
    );
    ramStick.position.set(-0.085, 0.32, rz);
    pcTower.add(ramStick);
  });

  // 3 Glowing Front Mesh Intake Fans (+Z face)
  [0.11, 0.23, 0.35].forEach((fy, idx) => {
    const fan = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.05, 0.008, 8, 20)),
      idx === 1 ? mats.rgbVioletGlow : mats.rgbCyanGlow,
    );
    fan.position.set(0, fy, 0.224);
    pcTower.add(fan);
  });

  g.add(pcTower);

  // -------------------------------------------------------
  // 5. DUAL STUDIO REFERENCE SPEAKERS, BOOM MIC & PERIPHERALS
  // -------------------------------------------------------
  [-0.86, 0.74].forEach((sx, idx) => {
    const spk = new THREE.Group();
    spk.position.set(sx, 0.755, -0.22);
    spk.rotation.y = idx === 0 ? 0.32 : -0.32;

    const stand = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.06, 0.14)),
      mats.matteBlackMetal,
    );
    stand.position.y = 0.03;
    spk.add(stand);

    const cab = new THREE.Mesh(
      trackGeo(createBeveledBox(0.14, 0.16, 0.23, 0.01)),
      mats.charcoalMatte,
    );
    cab.position.y = 0.06;
    cab.rotation.x = -0.1;
    spk.add(cab);

    const woofer = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 16)),
      mats.boucleLight,
    );
    woofer.rotation.x = Math.PI / 2 - 0.1;
    woofer.position.set(0, 0.135, 0.082);
    spk.add(woofer);

    const tweeter = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 12)),
      mats.brushedChrome,
    );
    tweeter.rotation.x = Math.PI / 2 - 0.1;
    tweeter.position.set(0, 0.225, 0.072);
    spk.add(tweeter);

    g.add(spk);
  });

  // XXL Desk Mat + Mechanical Keyboard + Wireless Mouse + MagSafe Phone Stand + Mug
  const deskMat = new THREE.Mesh(
    trackGeo(createBeveledBox(1.06, 0.42, 0.01, 0.003)),
    mats.charcoalMatte,
  );
  deskMat.position.set(-0.04, 0.753, 0.14);
  g.add(deskMat);

  const keyboard = new THREE.Group();
  keyboard.position.set(-0.08, 0.763, 0.12);
  const kbBody = new THREE.Mesh(
    trackGeo(createBeveledBox(0.36, 0.135, 0.022, 0.005)),
    mats.matteBlackMetal,
  );
  keyboard.add(kbBody);
  const kbKeys = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.335, 0.012, 0.11)),
    mats.boucleLight,
  );
  kbKeys.position.set(0, 0.024, 0);
  keyboard.add(kbKeys);
  const kbRgb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.355, 0.006, 0.132)),
    mats.rgbCyanGlow,
  );
  kbRgb.position.set(0, 0.006, 0);
  keyboard.add(kbRgb);
  g.add(keyboard);

  const mouse = new THREE.Mesh(
    trackGeo(createBeveledBox(0.062, 0.105, 0.032, 0.012)),
    mats.charcoalMatte,
  );
  mouse.position.set(0.24, 0.763, 0.13);
  g.add(mouse);

  // Podcast / Creator Boom Mic Arm (rear-left desk clamp -> rises above leftMonitor -> clears cleanly in front)
  const addCylSegment = (
    pA: THREE.Vector3,
    pB: THREE.Vector3,
    r: number,
    mat: THREE.Material,
  ) => {
    const dir = pB.clone().sub(pA);
    const len = dir.length();
    const seg = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(r, r, len, 10)),
      mat,
    );
    seg.name = 'boom-mic-part';
    seg.userData = { segStart: pA.clone(), segEnd: pB.clone() };
    seg.position.copy(pA).addScaledVector(dir, 0.5);
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    g.add(seg);
  };

  const micClamp = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.055, 0.045, 0.055)),
    mats.matteBlackMetal,
  );
  micClamp.name = 'boom-mic-part';
  micClamp.position.set(-1.05, 0.77, -0.32);
  g.add(micClamp);

  const micP0 = new THREE.Vector3(-1.05, 0.78, -0.32);
  const micP1 = new THREE.Vector3(-1.05, 1.33, -0.32); // Above leftMonitor top (1.25)
  const micP2 = new THREE.Vector3(-0.54, 1.31, 0.11); // Forward well ahead of monitors
  const micP3 = new THREE.Vector3(-0.42, 1.09, 0.17); // Drop to broadcast speaking height
  addCylSegment(micP0, micP1, 0.011, mats.matteBlackMetal);
  addCylSegment(micP1, micP2, 0.01, mats.matteBlackMetal);
  addCylSegment(micP2, micP3, 0.009, mats.matteBlackMetal);

  [micP1, micP2].forEach((jp) => {
    const joint = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.017, 10, 10)),
      mats.brushedChrome,
    );
    joint.name = 'boom-mic-part';
    joint.position.copy(jp);
    g.add(joint);
  });

  const micGroup = new THREE.Group();
  micGroup.position.set(-0.42, 1.03, 0.18);
  micGroup.rotation.x = 0.28;
  micGroup.rotation.z = -0.18;
  const micBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.115, 12)),
    mats.charcoalMatte,
  );
  micBody.name = 'boom-mic-part';
  micGroup.add(micBody);
  const micGrille = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.026, 0.026, 0.045, 12)),
    mats.brushedChrome,
  );
  micGrille.name = 'boom-mic-part';
  micGrille.position.y = 0.055;
  micGroup.add(micGrille);
  g.add(micGroup);

  // Studio Headphone Stand + Headphones
  const hpBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.065, 0.07, 0.014, 14)),
    mats.matteBlackMetal,
  );
  hpBase.position.set(-0.96, 0.764, 0.18);
  g.add(hpBase);

  const hpStem = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.009, 0.009, 0.25, 10)),
    mats.brushedChrome,
  );
  hpStem.position.set(-0.96, 0.89, 0.18);
  g.add(hpStem);

  const hpBand = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.068, 0.012, 8, 16, Math.PI)),
    mats.charcoalMatte,
  );
  hpBand.position.set(-0.96, 0.98, 0.18);
  hpBand.rotation.y = Math.PI / 2;
  g.add(hpBand);

  [-0.068, 0.068].forEach((hz) => {
    const cup = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.036, 0.036, 0.028, 12)),
      mats.matteBlackMetal,
    );
    cup.rotation.x = Math.PI / 2;
    cup.position.set(-0.96, 0.94, 0.18 + hz);
    g.add(cup);
  });

  // Coffee Mug + Smartphone Stand
  const mug = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.042, 0.038, 0.095, 14)),
    mats.whiteCeramic,
  );
  mug.position.set(0.42, 0.804, 0.22);
  g.add(mug);

  const phoneStand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.072, 0.135, 0.014)),
    mats.matteBlackMetal,
  );
  phoneStand.position.set(0.36, 0.825, -0.02);
  phoneStand.rotation.x = -0.35;
  phoneStand.rotation.y = -0.25;
  g.add(phoneStand);

  // -------------------------------------------------------
  // 6. HIGH-BACK ERGONOMIC MESH PRO TASK CHAIR (x=-0.06, z=+0.86)
  // -------------------------------------------------------
  const chair = new THREE.Group();
  chair.position.set(-0.06, 0, 0.86);
  chair.rotation.y = 0.24; // Subtle invitation angle toward room entrance

  // 5-Star Chrome Base & Dual-Wheel Casters
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const arm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.036, 0.026, 0.29)),
      mats.brushedChrome,
    );
    arm.position.set(Math.sin(ang) * 0.145, 0.055, Math.cos(ang) * 0.145);
    arm.rotation.y = ang;
    chair.add(arm);

    const caster = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.026, 0.026, 0.032, 10)),
      mats.matteBlackMetal,
    );
    caster.rotation.z = Math.PI / 2;
    caster.position.set(Math.sin(ang) * 0.275, 0.026, Math.cos(ang) * 0.275);
    chair.add(caster);
  }

  // Pneumatic Cylinder
  const cylinder = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.026, 0.028, 0.37, 12)),
    mats.matteBlackMetal,
  );
  cylinder.position.y = 0.25;
  chair.add(cylinder);

  // Contoured Seat Cushion + Armrests
  const seatCushion = new THREE.Mesh(
    trackGeo(createBeveledBox(0.5, 0.48, 0.085, 0.025)),
    mats.charcoalMatte,
  );
  seatCushion.position.set(0, 0.42, 0.01);
  seatCushion.castShadow = !isSoftwareGl;
  chair.add(seatCushion);

  [-0.275, 0.275].forEach((ax) => {
    const armPost = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.035, 0.22, 0.04)),
      mats.brushedChrome,
    );
    armPost.position.set(ax, 0.56, 0.04);
    chair.add(armPost);

    const armPad = new THREE.Mesh(
      trackGeo(createBeveledBox(0.075, 0.24, 0.032, 0.01)),
      mats.matteBlackMetal,
    );
    armPad.position.set(ax, 0.655, 0.01);
    chair.add(armPad);
  });

  // Sculpted Lumbar Backrest Frame + Headrest (at +Z facing monitors at -Z)
  const backSpine = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.09, 0.54, 0.035)),
    mats.brushedChrome,
  );
  backSpine.position.set(0, 0.68, 0.245);
  backSpine.rotation.x = 0.09;
  chair.add(backSpine);

  const backMesh = new THREE.Mesh(
    trackGeo(createBeveledBox(0.46, 0.055, 0.62, 0.018)),
    mats.charcoalMatte,
  );
  backMesh.position.set(0, 0.5, 0.23);
  backMesh.rotation.x = 0.09;
  backMesh.castShadow = !isSoftwareGl;
  chair.add(backMesh);

  const lumbarBar = new THREE.Mesh(
    trackGeo(createBeveledBox(0.42, 0.065, 0.1, 0.015)),
    mats.matteBlackMetal,
  );
  lumbarBar.position.set(0, 0.63, 0.21);
  chair.add(lumbarBar);

  const headrestStem = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.06, 0.12, 0.025)),
    mats.matteBlackMetal,
  );
  headrestStem.position.set(0, 1.15, 0.265);
  chair.add(headrestStem);

  const headrest = new THREE.Mesh(
    trackGeo(createBeveledBox(0.3, 0.065, 0.14, 0.02)),
    mats.charcoalMatte,
  );
  headrest.position.set(0, 1.18, 0.245);
  headrest.rotation.x = -0.16;
  chair.add(headrest);

  g.add(chair);

  return g;
}

/**
 * Builds the companion left-wall tech bookcase + 4-bay NAS server unit,
 * east-wall pegboard organizer, and corner RGB floor lamp inside the 1st-floor study.
 */
export function buildTechStudyCompanionProps(
  mats: FurnishingMaterials,
  trackGeo: TrackGeoFn,
  isSoftwareGl: boolean,
): THREE.Group {
  const g = new THREE.Group();

  // 1. Left-Wall Tech Bookcase & 4-Bay NAS Shelf (x = -0.68, z = -6.36)
  const bookcase = new THREE.Group();
  bookcase.position.set(-0.68, 0, -6.36);

  const frame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.48, 2.46, 0.42)),
    mats.charcoalMatte,
  );
  frame.position.set(0, 1.23, 0);
  frame.castShadow = !isSoftwareGl;
  bookcase.add(frame);

  for (let s = 0; s < 4; s++) {
    const sy = 0.52 + s * 0.54;
    const shelf = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.38, 0.038, 0.44)),
      mats.oak,
    );
    shelf.position.set(0, sy, 0.02);
    bookcase.add(shelf);

    // Populate shelves with tech books, archival boxes, and desktop NAS
    if (s === 0) {
      const nas = new THREE.Mesh(
        trackGeo(createBeveledBox(0.24, 0.24, 0.19, 0.008)),
        mats.matteBlackMetal,
      );
      nas.position.set(-0.42, sy + 0.02, 0.06);
      bookcase.add(nas);
      for (let d = 0; d < 4; d++) {
        const led = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.012, 0.012, 0.01)),
          mats.rgbCyanGlow,
        );
        led.position.set(-0.48 + d * 0.04, sy + 0.15, 0.184);
        bookcase.add(led);
      }

      const upsBox = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.2, 0.24, 0.24)),
        mats.charcoalMatte,
      );
      upsBox.position.set(0.32, sy + 0.14, 0.06);
      bookcase.add(upsBox);
    } else if (s === 1 || s === 2) {
      for (let b = 0; b < 7; b++) {
        const book = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.042, 0.24 + ((b + s) % 3) * 0.03, 0.2)),
          b % 3 === 0 ? mats.boucleLight : b % 3 === 1 ? mats.taupePaint : mats.matteBlackMetal,
        );
        book.position.set(-0.48 + b * 0.052 + (s === 2 ? 0.58 : 0), sy + 0.15, 0.06);
        bookcase.add(book);
      }
      const archBox = new THREE.Mesh(
        trackGeo(createBeveledBox(0.36, 0.24, 0.18, 0.008)),
        mats.taupePaint,
      );
      archBox.position.set(s === 1 ? 0.34 : -0.34, sy + 0.02, 0.06);
      bookcase.add(archBox);
    }
  }
  g.add(bookcase);

  // 2. East Wall Tech Gear Pegboard Organizer (x = 3.77, y = 1.52, z = -5.2)
  const pegboard = new THREE.Group();
  pegboard.position.set(3.77, 1.52, -5.2);
  pegboard.rotation.y = -Math.PI / 2;

  const board = new THREE.Mesh(
    trackGeo(createBeveledBox(0.92, 0.025, 0.62, 0.006)),
    mats.matteBlackMetal,
  );
  board.position.set(0, -0.31, 0);
  pegboard.add(board);

  // Mounted spare custom mechanical keyboard + dual game controllers on pegboard
  const spareKb = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.34, 0.12, 0.03)),
    mats.boucleLight,
  );
  spareKb.position.set(-0.2, 0.12, 0.024);
  pegboard.add(spareKb);

  const spareKbBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.36, 0.135, 0.02)),
    mats.charcoalMatte,
  );
  spareKbBase.position.set(-0.2, 0.12, 0.016);
  pegboard.add(spareKbBase);

  [0.2, 0.2].forEach((_, ci) => {
    const ctrl = new THREE.Mesh(
      trackGeo(createBeveledBox(0.14, 0.04, 0.095, 0.012)),
      ci === 0 ? mats.charcoalMatte : mats.boucleLight,
    );
    ctrl.position.set(0.22, ci === 0 ? 0.07 : -0.15, 0.026);
    pegboard.add(ctrl);
  });

  const pegLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.84, 0.012, 0.012)),
    mats.rgbVioletGlow,
  );
  pegLed.position.set(0, 0.3, 0.018);
  pegboard.add(pegLed);

  g.add(pegboard);

  // 3. Minimalist Vertical Corner RGB Accent Floor Lamp (x = 3.55, z = -6.28)
  const cornerLamp = new THREE.Group();
  cornerLamp.position.set(3.55, 0, -6.28);

  const lampBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.025, 16)),
    mats.matteBlackMetal,
  );
  lampBase.position.y = 0.0125;
  cornerLamp.add(lampBase);

  const lampPole = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.032, 1.56, 0.032)),
    mats.matteBlackMetal,
  );
  lampPole.position.y = 0.79;
  cornerLamp.add(lampPole);

  const lampGlow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.022, 1.48, 0.016)),
    mats.rgbVioletGlow,
  );
  lampGlow.position.set(-0.015, 0.79, 0.015);
  lampGlow.rotation.y = -Math.PI / 4;
  cornerLamp.add(lampGlow);

  g.add(cornerLamp);

  return g;
}
