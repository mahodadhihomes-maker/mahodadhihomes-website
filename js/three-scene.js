/**
 * Premium cinematic 3D real-estate hero
 * Requires Three.js r128 + GLTFLoader + EffectComposer + UnrealBloomPass.
 */

(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');

  // r128 exposes example utilities on THREE, not window.
  if (!canvas || !window.THREE || !THREE.GLTFLoader) return;

  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  var reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* Renderer */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75)
  );
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* Scene */
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf5f1e8, isMobile ? 0.03 : 0.018);

  var camera = new THREE.PerspectiveCamera(
    isMobile ? 42 : 36,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  var buildingRig = new THREE.Group();
  buildingRig.position.set(0, 0, 0);
  scene.add(buildingRig);

  var buildingModel = new THREE.Group();
  buildingRig.add(buildingModel);

  var mouse = new THREE.Vector2(0, 0);
  var smoothMouse = new THREE.Vector2(0, 0);
  var lookTarget = new THREE.Vector3();
  var scroll = { progress: 0 };

  /* Sky */
  var sky = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0xeef2f8) },
        horizonColor: { value: new THREE.Color(0xf7f2e6) },
        sunDirection: { value: new THREE.Vector3(-0.55, 0.25, -0.5) }
      },
      vertexShader:
        'varying vec3 vWorldPosition;' +
        'void main() {' +
        ' vWorldPosition = normalize((modelMatrix * vec4(position, 1.0)).xyz);' +
        ' gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' +
        '}',
      fragmentShader:
        'uniform vec3 topColor;' +
        'uniform vec3 horizonColor;' +
        'uniform vec3 sunDirection;' +
        'varying vec3 vWorldPosition;' +
        'void main() {' +
        ' float horizon = smoothstep(-0.35, 0.8, vWorldPosition.y);' +
        ' vec3 color = mix(horizonColor, topColor, horizon);' +
        ' float sun = pow(max(dot(vWorldPosition, normalize(sunDirection)), 0.0), 18.0);' +
        ' color += vec3(1.0, 0.92, 0.75) * sun * 0.25;' +
        ' gl_FragColor = vec4(color, 1.0);' +
        '}'
    })
  );

  scene.add(sky);

  /* Premium architectural lighting */
  var hemisphere = new THREE.HemisphereLight(0x6f98c8, 0x101017, 1.3);
  scene.add(hemisphere);

  var sun = new THREE.DirectionalLight(0xffbc75, 3.4);
  sun.position.set(-8, 9, 6);
  sun.castShadow = !isMobile;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  scene.add(sun);

  var coolRim = new THREE.DirectionalLight(0x76a9e6, 2.1);
  coolRim.position.set(7, 4, -6);
  scene.add(coolRim);

  var warmInteriorGlow = new THREE.PointLight(0xf3a94b, 2.4, 16, 2);
  warmInteriorGlow.position.set(2.4, 3.2, 3);
  scene.add(warmInteriorGlow);

  /* Floating platform */
  var platform = new THREE.Group();
  platform.position.y = -2.15;
  buildingRig.add(platform);

  var plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.9, 0.42, 96),
    new THREE.MeshStandardMaterial({
      color: 0x131d2b,
      roughness: 0.3,
      metalness: 0.72
    })
  );

  plinth.castShadow = true;
  plinth.receiveShadow = true;
  platform.add(plinth);

  var platformTop = new THREE.Mesh(
    new THREE.CircleGeometry(4.38, 96),
    new THREE.MeshStandardMaterial({
      color: 0x1d2a39,
      roughness: 0.42,
      metalness: 0.35
    })
  );

  platformTop.rotation.x = -Math.PI / 2;
  platformTop.position.y = 0.225;
  platformTop.receiveShadow = true;
  platform.add(platformTop);

  var goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.56, 0.025, 8, 96),
    new THREE.MeshBasicMaterial({
      color: 0xd6a55c,
      transparent: true,
      opacity: 0.82
    })
  );

  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.23;
  platform.add(goldRing);

  var contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64),
    new THREE.MeshBasicMaterial({
      color: 0x020408,
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    })
  );

  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.24;
  contactShadow.scale.set(1, 0.42, 1);
  platform.add(contactShadow);

  /* Soft dust particles */
  var particleCount = isMobile ? 55 : 170;
  var particlePositions = new Float32Array(particleCount * 3);

  for (var i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 18;
    particlePositions[i * 3 + 1] = Math.random() * 10 - 3;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 3;
  }

  var dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(particlePositions, 3)
  );

  var dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xf0cf94,
      size: isMobile ? 0.025 : 0.04,
      transparent: true,
      opacity: 0.58,
      depthWrite: false
    })
  );

  scene.add(dust);

  /* Optional desktop bloom */
  var composer = null;

  if (
    !isMobile &&
    THREE.EffectComposer &&
    THREE.RenderPass &&
    THREE.UnrealBloomPass
  ) {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    var bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.32,
      0.55,
      0.84
    );

    composer.addPass(bloom);

    if (THREE.ShaderPass && THREE.FXAAShader) {
      var fxaa = new THREE.ShaderPass(THREE.FXAAShader);
      composer.addPass(fxaa);
      composer.fxaaPass = fxaa;
    }
  }

  function makeMaterialsPremium(root) {
    root.traverse(function (child) {
      if (!child.isMesh) return;

      child.castShadow = !isMobile;
      child.receiveShadow = !isMobile;

      var materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach(function (material) {
        if (!material) return;

        material.envMapIntensity = 1.15;
        material.needsUpdate = true;

        if (material.name && /glass|window/i.test(material.name)) {
          material.roughness = 0.13;
          material.metalness = 0.2;
          material.emissive = new THREE.Color(0x4b250a);
          material.emissiveIntensity = 0.2;
        }
      });
    });
  }

  function frameModel(object) {
    buildingModel.add(object);

    var box = new THREE.Box3().setFromObject(object);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());

    var largestSide = Math.max(size.x, size.y, size.z) || 1;
    var scale = (isMobile ? 6.4 : 7.4) / largestSide;

    object.position.sub(center);
    object.scale.setScalar(scale);

    /* Rest the building naturally above the floating plinth */
    object.position.y = -1.92 + size.y * scale * 0.5;

    canvas.classList.add('is-ready');

    if (window.gsap) {
      gsap.fromTo(
        buildingModel,
        { y: -0.8, scale: 0.92 },
        { y: 0, scale: 1, duration: 2, ease: 'power4.out' }
      );
    }
  }

  /* Load the real 3D building model directly (no flat image fallback) */
  new THREE.GLTFLoader().load(
    'models/a7809272-ff56-4fc5-8afb-962eb625d9dc.glb',
    function (gltf) {
      makeMaterialsPremium(gltf.scene);
      frameModel(gltf.scene);
    },
    undefined,
    function (error) {
      console.error('Failed to load 3D building model:', error);
    }
  );

  function resize() {
    isMobile = window.matchMedia('(max-width: 767px)').matches;

    var width = canvas.clientWidth || window.innerWidth;
    var height = canvas.clientHeight || window.innerHeight;

    buildingRig.position.x = 0;

    camera.aspect = width / height;
    camera.fov = isMobile ? 42 : 36;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);

    if (composer) {
      composer.setSize(width, height);

      if (composer.fxaaPass) {
        composer.fxaaPass.material.uniforms.resolution.value.set(
          1 / (width * renderer.getPixelRatio()),
          1 / (height * renderer.getPixelRatio())
        );
      }
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener(
    'pointermove',
    function (event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true }
  );

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(scroll, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    gsap.to('.hero-content', {
      opacity: 0,
      y: -45,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '55% top',
        scrub: true
      }
    });
  }

  var clock = new THREE.Clock();
  var animationFrame;
  var active = true;

  function animate() {
    if (!active) return;

    animationFrame = requestAnimationFrame(animate);

    var time = clock.getElapsedTime();

    smoothMouse.lerp(mouse, 0.035);

    /* Elegant camera-follow motion: always below 5 degrees */
    var mouseRotation = isMobile || reducedMotion ? 0 : smoothMouse.x * 0.06;
    var orbit = isMobile || reducedMotion ? 0 : Math.sin(time * 0.13) * 0.05;

    buildingRig.rotation.y +=
      (mouseRotation + orbit + scroll.progress * 0.12 - buildingRig.rotation.y) *
      0.028;

    buildingRig.rotation.x +=
      ((isMobile ? 0 : -smoothMouse.y * 0.02) - buildingRig.rotation.x) * 0.028;

    buildingRig.position.y =
      Math.sin(time * 0.52) * (reducedMotion ? 0 : 0.055) +
      scroll.progress * 0.85;

    platform.rotation.y = time * 0.03;
    dust.rotation.y = time * 0.017;
    dust.position.y = Math.sin(time * 0.2) * 0.2;

    sun.intensity = 3.2 + Math.sin(time * 0.18) * 0.18;

    camera.position.set(
      isMobile ? 0 : smoothMouse.x * 0.18,
      0.15 + Math.sin(time * 0.17) * 0.1 + scroll.progress * 1.1,
      isMobile ? 13.5 : 15 - scroll.progress * 1.5
    );

    lookTarget.set(
      buildingRig.position.x,
      0.08 + scroll.progress * 0.55,
      0
    );

    camera.lookAt(lookTarget);

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  animate();

  document.addEventListener('visibilitychange', function () {
    active = !document.hidden;

    if (active) {
      clock.getDelta();
      animate();
    }
  });

  window.destroyThreeScene = function () {
    active = false;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    window.removeEventListener('resize', resize);
    dustGeometry.dispose();
    renderer.dispose();

    if (composer) {
      composer.dispose();
    }
  };
})();