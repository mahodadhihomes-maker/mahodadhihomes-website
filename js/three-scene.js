/**
 * Cinematic GLB hero scene. Kept self-contained so the page can degrade
 * gracefully when WebGL or an optional post-process pass is unavailable.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE || !window.GLTFLoader) return;

  var mobile = window.matchMedia('(max-width: 767px)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07101d, mobile ? 0.028 : 0.019);
  var camera = new THREE.PerspectiveCamera(mobile ? 42 : 36, 1, 0.1, 80);
  var target = new THREE.Vector3(2.7, 0.35, 0);
  var mouse = new THREE.Vector2();
  var smoothMouse = new THREE.Vector2();
  var scroll = { progress: 0 };
  var hero = new THREE.Group();
  var model = new THREE.Group();
  hero.add(model);
  scene.add(hero);

  // A PMREM environment gives physically based materials a soft HDR-like studio reflection
  // without imposing a remote HDR download on the first meaningful paint.
  var envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x152943);
  var envKey = new THREE.DirectionalLight(0xffd0a0, 3.5); envKey.position.set(-4, 7, 4); envScene.add(envKey);
  var envFill = new THREE.HemisphereLight(0x5d8cc4, 0x15100d, 2.2); envScene.add(envFill);
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  // Lighting: cool northern fill, low golden sun and a gentle architectural rim.
  var hemi = new THREE.HemisphereLight(0x7195c4, 0x11131a, 1.25); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffbd77, 3.3); sun.position.set(-7, 8, 6); sun.castShadow = !mobile;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -10; sun.shadow.camera.right = 10; sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10; scene.add(sun);
  var rim = new THREE.DirectionalLight(0x7aa7e0, 2.1); rim.position.set(6, 3, -5); scene.add(rim);
  var warmGlow = new THREE.PointLight(0xf0a74e, 2.2, 15, 2); warmGlow.position.set(2.7, 2.8, 3); scene.add(warmGlow);

  function makeSky() {
    var sky = new THREE.Mesh(new THREE.SphereGeometry(45, 32, 18), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { uTop: { value: new THREE.Color(0x05101e) }, uHorizon: { value: new THREE.Color(0x365474) }, uSun: { value: new THREE.Vector3(-0.55, 0.25, -0.6) } },
      vertexShader: 'varying vec3 vWorld; void main(){vWorld=normalize((modelMatrix*vec4(position,1.)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform vec3 uTop,uHorizon,uSun; varying vec3 vWorld; void main(){float h=smoothstep(-.35,.8,vWorld.y); vec3 c=mix(uHorizon,uTop,h); float s=pow(max(dot(vWorld,normalize(uSun)),0.),18.); c+=vec3(.85,.42,.14)*s*.34; gl_FragColor=vec4(c,1.);}'
    }));
    scene.add(sky);
  }
  makeSky();

  // Floating platform, inset gold edge, contact shadow and a restrained architectural grid.
  var platform = new THREE.Group(); platform.position.set(2.7, -2.15, 0); hero.add(platform);
  var plinth = new THREE.Mesh(new THREE.CylinderGeometry(4.55, 4.9, 0.42, 96), new THREE.MeshStandardMaterial({ color: 0x111925, roughness: 0.32, metalness: 0.72, envMapIntensity: 1.4 }));
  plinth.castShadow = plinth.receiveShadow = true; platform.add(plinth);
  var edge = new THREE.Mesh(new THREE.TorusGeometry(4.57, 0.026, 8, 96), new THREE.MeshBasicMaterial({ color: 0xc99a58, transparent: true, opacity: 0.82 })); edge.rotation.x = Math.PI / 2; edge.position.y = 0.23; platform.add(edge);
  var floor = new THREE.Mesh(new THREE.CircleGeometry(4.4, 96), new THREE.MeshStandardMaterial({ color: 0x182534, roughness: 0.46, metalness: 0.35 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.225; floor.receiveShadow = true; platform.add(floor);
  var shadow = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.MeshBasicMaterial({ color: 0x02050a, transparent: true, opacity: 0.46, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.242; shadow.scale.set(1, .44, 1); platform.add(shadow);
  var grid = new THREE.GridHelper(8.2, 14, 0x9b7544, 0x29405c); grid.position.set(2.7, -2.37, -0.05); grid.material.transparent = true; grid.material.opacity = 0.15; scene.add(grid);

  // Fine, slow-moving dust is deliberately non-additive: atmospheric rather than game-like.
  var count = mobile ? 55 : 170, positions = new Float32Array(count * 3), seeds = new Float32Array(count);
  for (var i = 0; i < count; i++) { positions[i * 3] = (Math.random() - .5) * 17; positions[i * 3 + 1] = Math.random() * 9 - 3; positions[i * 3 + 2] = (Math.random() - .5) * 12 - 4; seeds[i] = Math.random() * 6.28; }
  var dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xe6c58f, size: mobile ? .025 : .035, transparent: true, opacity: .58, depthWrite: false, sizeAttenuation: true })); scene.add(dust);

  // Post processing is adaptive; bloom and anti-aliasing are skipped on small screens.
  var composer = null;
  if (!mobile && window.EffectComposer && window.RenderPass && window.UnrealBloomPass) {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    var bloom = new THREE.UnrealBloomPass(new THREE.Vector2(1, 1), .34, .58, .82); composer.addPass(bloom);
    if (window.ShaderPass && window.FXAAShader) { var fxaa = new THREE.ShaderPass(THREE.FXAAShader); composer.addPass(fxaa); composer.fxaaPass = fxaa; }
  }

  function setMaterials(root) {
    root.traverse(function (node) {
      if (!node.isMesh) return;
      node.castShadow = !mobile; node.receiveShadow = !mobile;
      var materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(function (mat) {
        if (!mat) return;
        mat.envMapIntensity = 1.2;
        mat.needsUpdate = true;
        // Glass naturally picks up cool environment reflections; emissive windows stay warm.
        if (mat.name && /glass|window/i.test(mat.name)) { mat.roughness = .14; mat.metalness = .2; mat.emissive = new THREE.Color(0x4b260c); mat.emissiveIntensity = .18; }
      });
    });
  }

  function frameModel(object) {
    model.add(object);
    var box = new THREE.Box3().setFromObject(object), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    object.position.sub(center); object.position.y += size.y * .5 - 1.92;
    var longest = Math.max(size.x, size.y, size.z) || 1;
    object.scale.setScalar(5.7 / longest);
    canvas.classList.add('is-ready');
    if (window.gsap) gsap.fromTo(model, { y: -1.0, scale: .92 }, { y: 0, scale: 1, duration: 2.1, ease: 'power4.out' });
  }
  var fallback = null;
  function showImageFallback() {
    if (fallback) return;
    new THREE.TextureLoader().load('images/hero-building.jpg', function (texture) {
      texture.encoding = THREE.sRGBEncoding;
      var aspect = texture.image.width / texture.image.height;
      fallback = new THREE.Mesh(
        new THREE.PlaneGeometry(5.8 * aspect, 5.8),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: .94, depthWrite: false })
      );
      fallback.position.y = .5;
      model.add(fallback);
      canvas.classList.add('is-ready');
    });
  }
  // A visible local preview prevents the hero from looking empty during the GLB download.
  showImageFallback();
  // building.glb in the source archive is an empty placeholder. Load the real local model.
  new THREE.GLTFLoader().load('models/a7809272-ff56-4fc5-8afb-962eb625d9dc.glb', function (gltf) {
    setMaterials(gltf.scene);
    frameModel(gltf.scene);
    if (fallback) {
      var preview = fallback;
      if (window.gsap) {
        gsap.to(preview.material, { opacity: 0, duration: .45, onComplete: function () {
          model.remove(preview); preview.geometry.dispose(); preview.material.dispose(); fallback = null;
        } });
      } else {
        model.remove(preview); preview.geometry.dispose(); preview.material.dispose(); fallback = null;
      }
    }
  }, undefined, function () {
    // Keep the hero polished even if a browser cannot decode the GLB.
    showImageFallback();
  });

  function resize() {
    mobile = window.matchMedia('(max-width: 767px)').matches;
    var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    if (composer) { composer.setSize(w, h); if (composer.fxaaPass) composer.fxaaPass.material.uniforms.resolution.value.set(1 / (w * renderer.getPixelRatio()), 1 / (h * renderer.getPixelRatio())); }
  }
  resize(); window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', function (event) { mouse.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1)); }, { passive: true });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(scroll, { progress: 1, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to('.hero-content', { opacity: 0, y: -48, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '55% top', scrub: true } });
  }

  var clock = new THREE.Clock(), raf, running = true;
  function render() {
    if (!running) return;
    raf = requestAnimationFrame(render);
    var t = clock.getElapsedTime();
    smoothMouse.lerp(mouse, .035);
    var orbit = mobile || reducedMotion ? 0 : Math.sin(t * .13) * .085; // under 5 degrees
    hero.rotation.y += ((orbit + smoothMouse.x * .055 + scroll.progress * .16) - hero.rotation.y) * .028;
    hero.rotation.x += ((mobile ? 0 : -smoothMouse.y * .022) - hero.rotation.x) * .026;
    hero.position.y = Math.sin(t * .52) * (reducedMotion ? 0 : .055) + scroll.progress * .9;
    platform.rotation.y = t * .035;
    dust.rotation.y = t * .018; dust.position.y = Math.sin(t * .22) * .25;
    sun.intensity = 3.15 + Math.sin(t * .18) * .2;
    camera.position.set(mobile ? .1 : smoothMouse.x * .18, .15 + Math.sin(t * .17) * .12 + scroll.progress * 1.25, mobile ? 13.2 : 15.1 - scroll.progress * 1.65);
    target.set(mobile ? 0 : 2.7, .05 + scroll.progress * .58, 0); camera.lookAt(target);
    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  render();
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) { clock.getDelta(); render(); } });
  window.destroyThreeScene = function () { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); dustGeo.dispose(); renderer.dispose(); if (composer) composer.dispose(); };
})();
