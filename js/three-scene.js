/**
 * Three.js 3D Hero Scene – Premium Residential Tower
 * Renders a procedurally generated modern apartment building
 * with floating geometric accents, parallax mouse tracking,
 * and smooth auto-rotation inside <canvas id="hero-canvas">.
 *
 * Depends on THREE being available globally (r128 CDN).
 */

(function () {
  'use strict';

  /* ───────────────────────── canvas check ───────────────────────── */
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  /* ───────────────────────── palette ─────────────────────────────── */
  var COL = {
    building: 0xf0f0f0,
    glass:    0x88ccff,
    gold:     0xc9a96e,
    base:     0xe8e8e8,
    floor:    0xd0d0d0
  };

  /* ───────────────────────── renderer ────────────────────────────── */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ───────────────────────── scene & camera ──────────────────────── */
  var scene = new THREE.Scene();
  // No background — CSS gradient shows through (alpha: true)

  var camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(12, 8, 18);
  camera.lookAt(0, 3, 0);

  /* ───────────────────────── lighting ────────────────────────────── */
  // Ambient
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Directional (upper-right, casts shadows)
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 15, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -5;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  // Gold accent point light
  var goldLight = new THREE.PointLight(COL.gold, 0.3, 30);
  goldLight.position.set(-3, 10, 5);
  scene.add(goldLight);

  // Subtle fill from the opposite side
  var fillLight = new THREE.DirectionalLight(0xddeeff, 0.25);
  fillLight.position.set(-8, 5, -6);
  scene.add(fillLight);



  /* ───────────────────────── materials ───────────────────────────── */
  var buildingMat = new THREE.MeshStandardMaterial({
    color: COL.building,
    roughness: 0.55,
    metalness: 0.05
  });

  // Physical blue glass with refraction
  var glassMat = new THREE.MeshPhysicalMaterial({
    color: COL.glass,
    metalness: 0.9,
    roughness: 0.05,
    transparent: true,
    opacity: 0.6,
    transmission: 0.4,
    thickness: 0.2,
    envMapIntensity: 1.2
  });

  // Warm glowing window material (lit apartments at night)
  var litGlassMat = new THREE.MeshBasicMaterial({
    color: 0xffe082
  });

  // Corner neon architectural lighting
  var neonMat = new THREE.MeshBasicMaterial({
    color: 0xffd54f
  });

  // Polished luxury gold
  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.15,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  var baseMat = new THREE.MeshStandardMaterial({
    color: COL.base,
    roughness: 0.6,
    metalness: 0.05
  });

  var floorLineMat = new THREE.MeshStandardMaterial({
    color: COL.floor,
    roughness: 0.7,
    metalness: 0.0
  });

  var glassSphereMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.3,
    envMapIntensity: 1.0
  });

  /* ───────────────────────── custom materials ───────────────────── */
  var slateBlueMat = new THREE.MeshStandardMaterial({
    color: 0x3e5366,
    roughness: 0.5,
    metalness: 0.1
  });

  var whiteBlockMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f7,
    roughness: 0.55,
    metalness: 0.05
  });

  var yellowAccentMat = new THREE.MeshStandardMaterial({
    color: 0xffb300, // Golden yellow trim from the image
    roughness: 0.45,
    metalness: 0.15
  });

  var marbleMat = new THREE.MeshStandardMaterial({
    color: 0xcebda5, // Beige marble entrance arch
    roughness: 0.35,
    metalness: 0.05
  });

  var darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a, // Fences, pergolas, and gates
    roughness: 0.5,
    metalness: 0.8
  });

  var foliageMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // Palm leaves
    roughness: 0.8,
    metalness: 0.0
  });

  var trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5d4037, // Palm trunk
    roughness: 0.9,
    metalness: 0.0
  });

  /* ───────────────────────── building group ──────────────────────── */
  var building = new THREE.Group();

  // 1. ---- Ground Disk ----
  var groundGeo = new THREE.CylinderGeometry(11, 11, 0.08, 64);
  var groundMat = new THREE.MeshStandardMaterial({
    color: 0xe5e5e7,
    roughness: 0.85,
    metalness: 0.05
  });
  var groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.6;
  groundMesh.receiveShadow = true;
  building.add(groundMesh);

  // 2. ---- Stilt Ground Floor Slab ----
  var stiltW = 12.8, stiltD = 3.6, stiltH = 0.15;
  var stiltSlabGeo = new THREE.BoxGeometry(stiltW, stiltH, stiltD);
  var stiltSlab = new THREE.Mesh(stiltSlabGeo, baseMat);
  stiltSlab.position.y = -0.5 + stiltH / 2;
  stiltSlab.receiveShadow = true;
  stiltSlab.castShadow = true;
  building.add(stiltSlab);

  // 3. ---- Stilt Columns (Ground floor pillars supporting the building) ----
  var columnHeight = 0.9;
  var columnGeo = new THREE.BoxGeometry(0.16, columnHeight, 0.16);
  var xPositions = [-6.0, -4.8, -3.6, -2.4, -1.2, 0.0, 1.2, 2.4, 3.6, 4.8, 6.0];
  var zPositions = [-1.5, 0.0, 1.5];

  xPositions.forEach(function (x) {
    zPositions.forEach(function (z) {
      // Don't place columns where the entrance gate is located
      if (x > 3.0 && z > 1.0) return;

      var colMesh = new THREE.Mesh(columnGeo, baseMat);
      colMesh.position.set(x, -0.5 - columnHeight / 2, z);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      building.add(colMesh);
    });
  });

  // 4. ---- Horizontal Building Blocks (5 distinct connected structures) ----
  var blockW = 2.4, blockH = 5.2, blockD = 3.2;
  var blockConfigs = [
    { x: -4.8, mat: whiteBlockMat,  type: 'balcony-yellow' }, // Block 1 (Leftmost, White, Yellow frames)
    { x: -2.4, mat: slateBlueMat,   type: 'standard-dark' },  // Block 2 (Left-Center, Slate blue)
    { x: 0.0,  mat: whiteBlockMat,  type: 'central-slit' },   // Block 3 (Center, White, vertical glass slit)
    { x: 2.4,  mat: slateBlueMat,   type: 'standard-yellow' },// Block 4 (Right-Center, Slate blue, Yellow trims)
    { x: 4.8,  mat: whiteBlockMat,  type: 'balcony-yellow' }  // Block 5 (Rightmost, White, Yellow frames)
  ];

  var numFloors = 5;
  var floorHeight = (blockH - 0.2) / numFloors;

  blockConfigs.forEach(function (cfg) {
    // Main block mesh
    var bGeo = new THREE.BoxGeometry(blockW, blockH, blockD);
    var bMesh = new THREE.Mesh(bGeo, cfg.mat);
    bMesh.position.set(cfg.x, -0.5 + blockH / 2, 0);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    building.add(bMesh);

    // Floor lines (horizontal lines dividing floors)
    for (var f = 1; f < numFloors; f++) {
      var fLineGeo = new THREE.BoxGeometry(blockW + 0.02, 0.03, blockD + 0.02);
      var fLineMesh = new THREE.Mesh(fLineGeo, floorLineMat);
      fLineMesh.position.set(cfg.x, -0.5 + f * floorHeight, 0);
      building.add(fLineMesh);
    }

    // Windows and Architectural Balconies (by block type)
    for (var fl = 0; fl < numFloors; fl++) {
      var winY = -0.5 + fl * floorHeight + floorHeight / 2;

      // ---- Front face elements ----
      if (cfg.type === 'balcony-yellow') {
        // Two columns of windows per floor, with yellow frames and balconies
        for (var c = -1; c <= 1; c += 2) {
          var wX = cfg.x + c * 0.6;
          // Glass window
          var wGeo = new THREE.BoxGeometry(0.7, 0.55, 0.06);
          var wMat = Math.random() < 0.3 ? litGlassMat : glassMat;
          var wMesh = new THREE.Mesh(wGeo, wMat);
          wMesh.position.set(wX, winY, blockD / 2 + 0.02);
          building.add(wMesh);

          // Yellow frame box surrounding the balcony/window
          var frameGeo = new THREE.BoxGeometry(0.82, 0.67, 0.12);
          var frameMesh = new THREE.Mesh(frameGeo, yellowAccentMat);
          frameMesh.position.set(wX, winY, blockD / 2 + 0.05);
          building.add(frameMesh);

          // Balcony slab
          var balSlabGeo = new THREE.BoxGeometry(0.76, 0.04, 0.4);
          var balSlab = new THREE.Mesh(balSlabGeo, whiteBlockMat);
          balSlab.position.set(wX, winY - 0.32, blockD / 2 + 0.22);
          balSlab.castShadow = true;
          building.add(balSlab);

          // Balcony dark metallic railing
          var balRailGeo = new THREE.BoxGeometry(0.76, 0.2, 0.02);
          var balRail = new THREE.Mesh(balRailGeo, darkMetalMat);
          balRail.position.set(wX, winY - 0.22, blockD / 2 + 0.41);
          building.add(balRail);
        }
      } 
      else if (cfg.type === 'standard-dark') {
        // Dark slate-blue block with standard windows
        for (var c2 = -1; c2 <= 1; c2 += 2) {
          var wX2 = cfg.x + c2 * 0.6;
          var wGeo2 = new THREE.BoxGeometry(0.55, 0.55, 0.05);
          var wMat2 = Math.random() < 0.25 ? litGlassMat : glassMat;
          var wMesh2 = new THREE.Mesh(wGeo2, wMat2);
          wMesh2.position.set(wX2, winY, blockD / 2 + 0.02);
          building.add(wMesh2);

          // Dark concrete frames
          var fGeo = new THREE.BoxGeometry(0.67, 0.67, 0.06);
          var fMesh = new THREE.Mesh(fGeo, darkMetalMat);
          fMesh.position.set(wX2, winY, blockD / 2 + 0.02);
          building.add(fMesh);
        }
      } 
      else if (cfg.type === 'central-slit') {
        // White central block with vertical dark window slit in center, and regular windows on sides
        if (fl === 0) {
          // One tall vertical glass window running up the center of this block
          var slitGeo = new THREE.BoxGeometry(0.4, blockH - 0.8, 0.08);
          var slitMesh = new THREE.Mesh(slitGeo, glassMat);
          slitMesh.position.set(cfg.x, -0.5 + blockH / 2, blockD / 2 + 0.03);
          building.add(slitMesh);
        }

        // Side windows on Block 3
        for (var c3 = -1; c3 <= 1; c3 += 2) {
          var wX3 = cfg.x + c3 * 0.8;
          var wGeo3 = new THREE.BoxGeometry(0.5, 0.55, 0.05);
          var wMat3 = Math.random() < 0.35 ? litGlassMat : glassMat;
          var wMesh3 = new THREE.Mesh(wGeo3, wMat3);
          wMesh3.position.set(wX3, winY, blockD / 2 + 0.02);
          building.add(wMesh3);
        }
      } 
      else if (cfg.type === 'standard-yellow') {
        // Slate-blue block with yellow vertical trim accents and balconies
        for (var c4 = -1; c4 <= 1; c4 += 2) {
          var wX4 = cfg.x + c4 * 0.6;
          var wGeo4 = new THREE.BoxGeometry(0.65, 0.55, 0.05);
          var wMat4 = Math.random() < 0.2 ? litGlassMat : glassMat;
          var wMesh4 = new THREE.Mesh(wGeo4, wMat4);
          wMesh4.position.set(wX4, winY, blockD / 2 + 0.02);
          building.add(wMesh4);

          // Yellow panel side vertical columns
          var panelGeo = new THREE.BoxGeometry(0.12, 0.67, 0.08);
          var panelMesh = new THREE.Mesh(panelGeo, yellowAccentMat);
          panelMesh.position.set(wX4 - 0.38, winY, blockD / 2 + 0.03);
          building.add(panelMesh);
        }
      }
    }

    // 5. ---- Roof Terraces & Pergolas ----
    // Glass safety railing along front of each block roof
    var railFrontGeo = new THREE.BoxGeometry(blockW - 0.1, 0.35, 0.02);
    var railFront = new THREE.Mesh(railFrontGeo, glassMat);
    railFront.position.set(cfg.x, -0.5 + blockH + 0.18, blockD / 2 - 0.02);
    building.add(railFront);

    // Decorative pergolas on some roofs (blocks 1 and 3)
    if (cfg.type === 'balcony-yellow' || cfg.type === 'central-slit') {
      var pBarGeo = new THREE.BoxGeometry(blockW - 0.4, 0.06, 0.06);
      for (var pZ = -1.0; pZ <= 1.0; pZ += 0.5) {
        var pBar = new THREE.Mesh(pBarGeo, darkMetalMat);
        pBar.position.set(cfg.x, -0.5 + blockH + 0.3, pZ);
        building.add(pBar);
      }
    }
  });

  // 6. ---- Grand Entrance Archway & Gate (Front-Right, X = 3.5, Z = 2.4) ----
  var archX = 3.4, archZ = 2.0;

  // Beige marble arch pillars
  var pillarLGeo = new THREE.BoxGeometry(0.4, 1.8, 0.4);
  var pillarL = new THREE.Mesh(pillarLGeo, marbleMat);
  pillarL.position.set(archX - 1.2, -0.5 + 0.9, archZ);
  pillarL.castShadow = true;
  building.add(pillarL);

  var pillarRGeo = new THREE.BoxGeometry(0.4, 1.8, 0.4);
  var pillarR = new THREE.Mesh(pillarRGeo, marbleMat);
  pillarR.position.set(archX + 1.2, -0.5 + 0.9, archZ);
  pillarR.castShadow = true;
  building.add(pillarR);

  // Top header crossbeam
  var beamGeo = new THREE.BoxGeometry(2.8, 0.35, 0.48);
  var beam = new THREE.Mesh(beamGeo, marbleMat);
  beam.position.set(archX, -0.5 + 1.8 + 0.17, archZ);
  beam.castShadow = true;
  building.add(beam);

  // Gold logo plaque on top of arch beam
  var plaqueGeo = new THREE.BoxGeometry(0.5, 0.25, 0.04);
  var plaque = new THREE.Mesh(plaqueGeo, goldMat);
  plaque.position.set(archX, -0.5 + 1.8 + 0.17, archZ + 0.25);
  building.add(plaque);

  // Arch gate doors (lower dark metallic frames)
  var gateGeo = new THREE.BoxGeometry(1.0, 0.8, 0.04);
  for (var side = -1; side <= 1; side += 2) {
    var gateDoor = new THREE.Mesh(gateGeo, darkMetalMat);
    gateDoor.position.set(archX + side * 0.55, -0.5 + 0.4, archZ);
    building.add(gateDoor);
  }

  // 7. ---- Landscaping Front Palm Trees ----
  var palmConfigs = [
    { x: -5.4, z: 2.1 },
    { x: -3.8, z: 2.1 },
    { x: -1.0, z: 2.1 },
    { x: 1.0, z: 2.1 }
  ];

  palmConfigs.forEach(function (palm) {
    // Tree trunk (thin cylinders slightly bent/stacked)
    var trunkH = 0.95;
    var tGeo = new THREE.CylinderGeometry(0.04, 0.06, trunkH, 8);
    var tMesh = new THREE.Mesh(tGeo, trunkMat);
    tMesh.position.set(palm.x, -0.5 + trunkH / 2, palm.z);
    tMesh.castShadow = true;
    building.add(tMesh);

    // Palm leaves (layers of flat green rings/boxes)
    var leafGroup = new THREE.Group();
    leafGroup.position.set(palm.x, -0.5 + trunkH, palm.z);

    for (var l = 0; l < 5; l++) {
      var leafGeo = new THREE.BoxGeometry(0.55, 0.02, 0.12);
      var leaf = new THREE.Mesh(leafGeo, foliageMat);
      leaf.rotation.y = (l * Math.PI) / 2.5;
      leaf.rotation.z = 0.18; // Slightly droop
      leafGroup.add(leaf);
    }
    building.add(leafGroup);
  });

  scene.add(building);

  /* ───────────────────────── floating elements ──────────────────── */
  var floaters = [];

  // --- Torus Knots (gold) ---
  function createTorusKnot(radius, tube, p, q, scale) {
    var geo = new THREE.TorusKnotGeometry(radius, tube, 64, 8, p, q);
    var mesh = new THREE.Mesh(geo, goldMat);
    mesh.scale.setScalar(scale);
    mesh.castShadow = true;
    return mesh;
  }

  var tk1 = createTorusKnot(0.4, 0.12, 2, 3, 0.8);
  tk1.userData = { angle: 0, radius: 8.0, speed: 0.003, bobSpeed: 1.2, bobAmp: 0.4, baseY: 3.5 };
  building.add(tk1);
  floaters.push(tk1);

  var tk2 = createTorusKnot(0.35, 0.1, 3, 2, 0.6);
  tk2.userData = { angle: Math.PI * 0.6, radius: 9.0, speed: 0.0025, bobSpeed: 0.9, bobAmp: 0.5, baseY: 1.5 };
  building.add(tk2);
  floaters.push(tk2);

  // --- Glass Spheres ---
  function createGlassSphere(radius) {
    var geo = new THREE.SphereGeometry(radius, 32, 32);
    var mesh = new THREE.Mesh(geo, glassSphereMat);
    return mesh;
  }

  var gs1 = createGlassSphere(0.5);
  gs1.userData = { angle: Math.PI * 1.2, radius: 7.5, speed: 0.004, bobSpeed: 1.5, bobAmp: 0.35, baseY: 4.5 };
  building.add(gs1);
  floaters.push(gs1);

  var gs2 = createGlassSphere(0.35);
  gs2.userData = { angle: Math.PI * 1.8, radius: 9.5, speed: 0.002, bobSpeed: 1.0, bobAmp: 0.45, baseY: 1.0 };
  building.add(gs2);
  floaters.push(gs2);

  /* ───────────────────────── mouse parallax ──────────────────────── */
  var mouse = { x: 0, y: 0 };
  var targetRotX = 0;
  var targetRotY = 0;

  function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener('mousemove', onMouseMove, false);

  /* ───────────────────────── resize handler ──────────────────────── */
  var baseBuildingY = 0;
  function onResize() {
    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    // Responsive 3D building layout, scaling, and camera angles
    if (window.innerWidth < 480) {
      // Small Mobile
      building.scale.set(0.52, 0.52, 0.52); // Scale down building on mobile
      building.position.x = 0;
      baseBuildingY = -3.8; // Lower the building further down
      camera.position.set(0, 5, 26); // Shift camera back and down
      camera.lookAt(0, 1, 0);
    } else if (window.innerWidth < 768) {
      // Mobile
      building.scale.set(0.58, 0.58, 0.58);
      building.position.x = 0;
      baseBuildingY = -3.2;
      camera.position.set(0, 5, 25);
      camera.lookAt(0, 1.5, 0);
    } else if (window.innerWidth < 992) {
      // Tablet
      building.scale.set(0.75, 0.75, 0.75);
      building.position.x = 0;
      baseBuildingY = -2.5;
      camera.position.set(0, 6, 24);
      camera.lookAt(0, 2, 0);
    } else {
      // Desktop
      building.scale.set(1, 1, 1);
      building.position.x = 3.2;
      baseBuildingY = -0.3; // Offset to the right side on desktop
      camera.position.set(12, 8, 18); // Angled perspective on desktop
      camera.lookAt(0, 3, 0);
    }
    building.position.y = baseBuildingY;
  }
  window.addEventListener('resize', onResize, false);

  // Run layout placement once during startup
  onResize();  /* ───────────────────────── animation loop ─────────────────────── */
  var clock = new THREE.Clock();
  var autoRotation = 0;
  var rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);

    var elapsed = clock.getElapsedTime();

    // Auto-rotate building
    autoRotation += 0.002;

    // Parallax target (subtle tilt toward cursor)
    targetRotY = autoRotation + mouse.x * 0.15;
    targetRotX = mouse.y * 0.08;

    // Smooth interpolation for rotations
    building.rotation.y += (targetRotY - building.rotation.y) * 0.05;
    building.rotation.x += (targetRotX - building.rotation.x) * 0.05;

    // Slow luxury hovering bobbing effect
    building.position.y = baseBuildingY + Math.sin(elapsed * 0.6) * 0.18;

    // Animate floating elements
    for (var i = 0; i < floaters.length; i++) {
      var fl = floaters[i];
      var d = fl.userData;
      d.angle += d.speed;

      fl.position.x = Math.cos(d.angle) * d.radius;
      fl.position.z = Math.sin(d.angle) * d.radius;
      fl.position.y = d.baseY + Math.sin(elapsed * d.bobSpeed) * d.bobAmp;

      // Spin the floater itself
      fl.rotation.x += 0.008;
      fl.rotation.y += 0.012;
    }

    // Subtle gold light pulsation
    goldLight.intensity = 0.3 + Math.sin(elapsed * 0.8) * 0.1;

    renderer.render(scene, camera);
  }

  animate();

  /* ───────────────────────── cleanup / destroy ───────────────────── */
  function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('resize', onResize, false);

    // Dispose geometries and materials
    scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(function (m) { m.dispose(); });
        } else {
          obj.material.dispose();
        }
      }
    });

    renderer.dispose();
  }

  // Expose destroy on the canvas element for external use
  canvas.__threeDestroy = destroy;

  // Also expose globally in case needed
  window.destroyHeroScene = destroy;
})();
