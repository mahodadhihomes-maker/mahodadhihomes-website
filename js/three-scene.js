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
  renderer.setSize(window.innerWidth, window.innerHeight);
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

  /* ───────────────────────── building group ──────────────────────── */
  var building = new THREE.Group();

  // ---- Main body ----
  var bodyW = 4, bodyD = 3.2, bodyH = 14;
  var bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
  var bodyMesh = new THREE.Mesh(bodyGeo, buildingMat);
  bodyMesh.position.y = bodyH / 2;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  building.add(bodyMesh);

  // ---- Base platform ----
  var baseGeo = new THREE.BoxGeometry(bodyW + 1.2, 0.6, bodyD + 1.2);
  var baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.3;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  building.add(baseMesh);

  // Second tier base
  var base2Geo = new THREE.BoxGeometry(bodyW + 0.6, 0.4, bodyD + 0.6);
  var base2Mesh = new THREE.Mesh(base2Geo, baseMat);
  base2Mesh.position.y = 0.8;
  base2Mesh.receiveShadow = true;
  building.add(base2Mesh);

  // ---- Ground plane (subtle disk) ----
  var groundGeo = new THREE.CylinderGeometry(7, 7, 0.08, 64);
  var groundMat = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.9,
    metalness: 0.0
  });
  var groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.04;
  groundMesh.receiveShadow = true;
  building.add(groundMesh);

  // ---- Floor line indentations ----
  var numFloors = 16;
  var floorSpacing = (bodyH - 1) / numFloors;
  for (var f = 0; f < numFloors; f++) {
    var lineGeo = new THREE.BoxGeometry(bodyW + 0.02, 0.04, bodyD + 0.02);
    var lineMesh = new THREE.Mesh(lineGeo, floorLineMat);
    lineMesh.position.y = 1.2 + f * floorSpacing;
    building.add(lineMesh);
  }

  // ---- Glass windows ----
  var winW = 0.7, winH = 0.55, winD = 0.06;
  var windowsPerFloorFront = 4;
  var windowsPerFloorSide = 3;

  // ---- Corner Vertical Neon Lighting Columns ----
  var neonColumnGeo = new THREE.BoxGeometry(0.06, bodyH, 0.06);
  var corners = [
    { x: -bodyW / 2 - 0.01, z: bodyD / 2 + 0.01 },
    { x: bodyW / 2 + 0.01, z: bodyD / 2 + 0.01 },
    { x: -bodyW / 2 - 0.01, z: -bodyD / 2 - 0.01 },
    { x: bodyW / 2 + 0.01, z: -bodyD / 2 - 0.01 }
  ];
  corners.forEach(function (c) {
    var neonMesh = new THREE.Mesh(neonColumnGeo, neonMat);
    neonMesh.position.set(c.x, bodyH / 2, c.z);
    building.add(neonMesh);
  });

  for (var fl = 0; fl < numFloors; fl++) {
    var floorY = 1.2 + fl * floorSpacing + floorSpacing * 0.5;

    // Front face windows (z+)
    for (var wi = 0; wi < windowsPerFloorFront; wi++) {
      var winGeo = new THREE.BoxGeometry(winW, winH, winD);
      // 25% chance of warm glowing window, otherwise blue physical glass
      var winMatToUse = Math.random() < 0.28 ? litGlassMat : glassMat;
      var winMesh = new THREE.Mesh(winGeo, winMatToUse);
      var xOff = (wi - (windowsPerFloorFront - 1) / 2) * (bodyW / (windowsPerFloorFront + 0.5));
      winMesh.position.set(xOff, floorY, bodyD / 2 + 0.02);
      building.add(winMesh);

      // Add architectural balconies below some front windows
      if (fl > 1 && fl < numFloors - 2 && fl % 3 === 0 && wi % 2 === 0) {
        // Balcony slab
        var balconyGeo = new THREE.BoxGeometry(winW + 0.15, 0.04, 0.45);
        var balconyMesh = new THREE.Mesh(balconyGeo, buildingMat);
        balconyMesh.position.set(xOff, floorY - winH / 2 - 0.04, bodyD / 2 + 0.22);
        balconyMesh.castShadow = true;
        balconyMesh.receiveShadow = true;
        building.add(balconyMesh);

        // Balcony gold railing
        var railGeo = new THREE.BoxGeometry(winW + 0.15, 0.18, 0.02);
        var railMesh = new THREE.Mesh(railGeo, goldMat);
        railMesh.position.set(xOff, floorY - winH / 2 + 0.08, bodyD / 2 + 0.43);
        building.add(railMesh);
      }
    }

    // Back face windows (z-)
    for (var wi2 = 0; wi2 < windowsPerFloorFront; wi2++) {
      var winGeo2 = new THREE.BoxGeometry(winW, winH, winD);
      var winMatToUse2 = Math.random() < 0.28 ? litGlassMat : glassMat;
      var winMesh2 = new THREE.Mesh(winGeo2, winMatToUse2);
      var xOff2 = (wi2 - (windowsPerFloorFront - 1) / 2) * (bodyW / (windowsPerFloorFront + 0.5));
      winMesh2.position.set(xOff2, floorY, -(bodyD / 2 + 0.02));
      building.add(winMesh2);
    }

    // Left face windows (x-)
    for (var wi3 = 0; wi3 < windowsPerFloorSide; wi3++) {
      var winGeo3 = new THREE.BoxGeometry(winD, winH, winW);
      var winMatToUse3 = Math.random() < 0.25 ? litGlassMat : glassMat;
      var winMesh3 = new THREE.Mesh(winGeo3, winMatToUse3);
      var zOff = (wi3 - (windowsPerFloorSide - 1) / 2) * (bodyD / (windowsPerFloorSide + 0.5));
      winMesh3.position.set(-(bodyW / 2 + 0.02), floorY, zOff);
      building.add(winMesh3);
    }

    // Right face windows (x+)
    for (var wi4 = 0; wi4 < windowsPerFloorSide; wi4++) {
      var winGeo4 = new THREE.BoxGeometry(winD, winH, winW);
      var winMatToUse4 = Math.random() < 0.25 ? litGlassMat : glassMat;
      var winMesh4 = new THREE.Mesh(winGeo4, winMatToUse4);
      var zOff2 = (wi4 - (windowsPerFloorSide - 1) / 2) * (bodyD / (windowsPerFloorSide + 0.5));
      winMesh4.position.set(bodyW / 2 + 0.02, floorY, zOff2);
      building.add(winMesh4);
    }
  }

  // ---- Gold accent strip near the top ----
  var accentGeo = new THREE.BoxGeometry(bodyW + 0.08, 0.15, bodyD + 0.08);
  var accentMesh = new THREE.Mesh(accentGeo, goldMat);
  accentMesh.position.y = bodyH - 0.5;
  building.add(accentMesh);

  // Second gold accent (thinner, higher)
  var accent2Geo = new THREE.BoxGeometry(bodyW + 0.04, 0.06, bodyD + 0.04);
  var accent2Mesh = new THREE.Mesh(accent2Geo, goldMat);
  accent2Mesh.position.y = bodyH + 0.1;
  building.add(accent2Mesh);

  // ---- Sky Lounge Penthouse Glass Core & Walls ----
  var coreGeo = new THREE.BoxGeometry(bodyW - 1.2, 0.9, bodyD - 1.2);
  var coreMesh = new THREE.Mesh(coreGeo, litGlassMat);
  coreMesh.position.y = bodyH + 0.45;
  building.add(coreMesh);

  var loungeGeo = new THREE.BoxGeometry(bodyW - 0.6, 1.0, bodyD - 0.6);
  var loungeMesh = new THREE.Mesh(loungeGeo, glassMat);
  loungeMesh.position.y = bodyH + 0.5;
  building.add(loungeMesh);

  // Luxury gold crown cap
  var crownGeo = new THREE.BoxGeometry(bodyW - 0.4, 0.15, bodyD - 0.4);
  var crownMesh = new THREE.Mesh(crownGeo, goldMat);
  crownMesh.position.y = bodyH + 1.05;
  crownMesh.castShadow = true;
  building.add(crownMesh);

  // Spire & glowing beacon
  var spireGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.0, 8);
  var spireMesh = new THREE.Mesh(spireGeo, goldMat);
  spireMesh.position.y = bodyH + 2.05;
  building.add(spireMesh);

  var spireTopGeo = new THREE.SphereGeometry(0.08, 16, 16);
  var spireTopMesh = new THREE.Mesh(spireTopGeo, litGlassMat);
  spireTopMesh.position.y = bodyH + 3.05;
  building.add(spireTopMesh);

  // ---- Entrance canopy ----
  var canopyGeo = new THREE.BoxGeometry(1.8, 0.08, 1.2);
  var canopyMesh = new THREE.Mesh(canopyGeo, goldMat);
  canopyMesh.position.set(0, 1.6, bodyD / 2 + 0.6);
  canopyMesh.castShadow = true;
  building.add(canopyMesh);

  // Entrance glass door
  var doorGeo = new THREE.BoxGeometry(1.2, 1.4, 0.05);
  var doorMesh = new THREE.Mesh(doorGeo, glassMat);
  doorMesh.position.set(0, 1.3, bodyD / 2 + 0.02);
  building.add(doorMesh);

  // Canopy support pillars
  for (var p = -1; p <= 1; p += 2) {
    var pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    var pillarMesh = new THREE.Mesh(pillarGeo, goldMat);
    pillarMesh.position.set(p * 0.8, 1.3, bodyD / 2 + 1.15);
    building.add(pillarMesh);
  }
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
  tk1.userData = { angle: 0, radius: 6, speed: 0.003, bobSpeed: 1.2, bobAmp: 0.6, baseY: 10 };
  building.add(tk1); // Add to building instead of scene
  floaters.push(tk1);

  var tk2 = createTorusKnot(0.35, 0.1, 3, 2, 0.6);
  tk2.userData = { angle: Math.PI * 0.6, radius: 7, speed: 0.0025, bobSpeed: 0.9, bobAmp: 0.8, baseY: 5 };
  building.add(tk2); // Add to building instead of scene
  floaters.push(tk2);

  // --- Glass Spheres ---
  function createGlassSphere(radius) {
    var geo = new THREE.SphereGeometry(radius, 32, 32);
    var mesh = new THREE.Mesh(geo, glassSphereMat);
    return mesh;
  }

  var gs1 = createGlassSphere(0.5);
  gs1.userData = { angle: Math.PI * 1.2, radius: 5.5, speed: 0.004, bobSpeed: 1.5, bobAmp: 0.5, baseY: 12 };
  building.add(gs1); // Add to building instead of scene
  floaters.push(gs1);

  var gs2 = createGlassSphere(0.35);
  gs2.userData = { angle: Math.PI * 1.8, radius: 8, speed: 0.002, bobSpeed: 1.0, bobAmp: 0.7, baseY: 3 };
  building.add(gs2); // Add to building instead of scene
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

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
