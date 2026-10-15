/* ============================================================
   PORSCHE3D.JS — Three.js WebGL Porsche 992 GT3 RS
   Scroll-driven driving animation pinned by CSS sticky.
   Correct sRGB / physically-based lighting for true material colours.
   ============================================================ */

(function () {
  'use strict';

  function initPorscheHero() {
    const wrap = document.getElementById('trionn-symbol-canvas-wrap');
    if (!wrap || !window.THREE) return;

    const THREE = window.THREE;
    let width  = window.innerWidth;
    let height = window.innerHeight;

    function getDPR() {
      return Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.5);
    }

    // ── Minimal Loading HUD ──
    const loaderHUD = document.createElement('div');
    loaderHUD.id = 'porsche-loader';
    loaderHUD.innerHTML = `
      <div class="porsche-loader-inner">
        <div class="porsche-loader-title">PORSCHE 992 GT3 RS</div>
        <div class="porsche-loader-bar-bg">
          <div class="porsche-loader-bar-fill" id="porsche-loader-fill"></div>
        </div>
        <div class="porsche-loader-sub" id="porsche-loader-pct">LOADING · 0%</div>
      </div>
    `;
    wrap.appendChild(loaderHUD);

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0C0C0C);
    // Subtle fog so the road fades naturally
    scene.fog = new THREE.FogExp2(0x0C0C0C, 0.025);

    // ── Camera ──
    function getCameraConfig() {
      if (width >= 1440) return { fov: 38, y: 0.9,  z: 5.8 };
      if (width >= 1024) return { fov: 40, y: 1.0,  z: 6.4 };
      if (width >= 768)  return { fov: 44, y: 1.05, z: 7.4 };
      return                     { fov: 48, y: 1.15, z: 8.6 };
    }

    const camCfg = getCameraConfig();
    const camera = new THREE.PerspectiveCamera(camCfg.fov, width / height, 0.1, 150);
    camera.position.set(0, camCfg.y, camCfg.z);
    camera.lookAt(0, 0.4, 0);

    // ── Renderer — correct sRGB output ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getDPR());
    renderer.setClearColor(0x0C0C0C, 1);

    // Physically correct lights so intensities match real lux scale
    renderer.physicallyCorrectLights = true;

    // sRGB output ensures textures reproduce their authored colours
    renderer.outputEncoding = THREE.sRGBEncoding;

    // ACES filmic tone-map — lower exposure to preserve colour saturation
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
    wrap.appendChild(renderer.domElement);

    // ── PMREM Environment — neutral studio grey box ──
    // Using a simple RoomEnvironment-style cube to give correct
    // reflections without washing out baked albedo textures.
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    // Neutral mid-grey backdrop
    envScene.background = new THREE.Color(0x141414);

    // Top softbox (warm white strip)
    const topBox = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 3),
      new THREE.MeshBasicMaterial({ color: 0xf0f0ec, side: THREE.DoubleSide })
    );
    topBox.position.set(0, 6, 0);
    topBox.rotation.x = Math.PI / 2;
    envScene.add(topBox);

    // Left fill (cool blue-white)
    const leftBox = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 2),
      new THREE.MeshBasicMaterial({ color: 0xc8d8f0, side: THREE.DoubleSide })
    );
    leftBox.position.set(-7, 2, 0);
    leftBox.rotation.y = Math.PI / 2;
    envScene.add(leftBox);

    // Right accent (warm orange strip — gives the GT3 RS signature rim highlight)
    const rightBox = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ color: 0xffd8a8, side: THREE.DoubleSide })
    );
    rightBox.position.set(7, 2, 0);
    rightBox.rotation.y = -Math.PI / 2;
    envScene.add(rightBox);

    const envRT = pmremGen.fromScene(envScene, 0.04);
    // Apply to scene — controls IBL reflections
    scene.environment = envRT.texture;

    // ── Lights ──
    // Key light — warm white from top-left (main paint highlight)
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.5);
    keyLight.position.set(-3, 7, 5);
    scene.add(keyLight);

    // Fill light — cooler from right
    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 1.8);
    fillLight.position.set(5, 3, 2);
    scene.add(fillLight);

    // Rim/back light — blue-white, catches the rear wing silhouette
    const rimLight = new THREE.DirectionalLight(0xb0c8ff, 2.4);
    rimLight.position.set(-2, 2, -6);
    scene.add(rimLight);

    // Subtle ambient so shadows stay deep but not pitch black
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    // Taillight glow
    const tailGlow = new THREE.PointLight(0xff2200, 8, 5);
    tailGlow.position.set(0, 0.6, -2.5);
    scene.add(tailGlow);

    // Headlight pair
    const hlL = new THREE.SpotLight(0xffffff, 6, 18, Math.PI / 8, 0.6);
    hlL.position.set(-0.65, 0.5, 2.4);
    hlL.target.position.set(-1, 0, 12);
    scene.add(hlL); scene.add(hlL.target);

    const hlR = new THREE.SpotLight(0xffffff, 6, 18, Math.PI / 8, 0.6);
    hlR.position.set(0.65, 0.5, 2.4);
    hlR.target.position.set(1, 0, 12);
    scene.add(hlR); scene.add(hlR.target);

    // ── Ground — contact shadow + road ──
    const shadowCvs = document.createElement('canvas');
    shadowCvs.width = 512; shadowCvs.height = 512;
    const sctx = shadowCvs.getContext('2d');
    const sg = sctx.createRadialGradient(256, 256, 30, 256, 256, 256);
    sg.addColorStop(0,   'rgba(0,0,0,0.9)');
    sg.addColorStop(0.35,'rgba(0,0,0,0.65)');
    sg.addColorStop(0.7, 'rgba(0,0,0,0.2)');
    sg.addColorStop(1,   'rgba(0,0,0,0)');
    sctx.fillStyle = sg;
    sctx.fillRect(0, 0, 512, 512);
    const shadowTex = new THREE.CanvasTexture(shadowCvs);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 4.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.004;
    scene.add(shadowPlane);

    // Dark asphalt road
    const roadCvs = document.createElement('canvas');
    roadCvs.width = 256; roadCvs.height = 256;
    const rctx = roadCvs.getContext('2d');
    rctx.fillStyle = '#0b0b0d';
    rctx.fillRect(0, 0, 256, 256);
    rctx.strokeStyle = 'rgba(255,255,255,0.018)';
    rctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 32) {
      rctx.beginPath(); rctx.moveTo(0, i); rctx.lineTo(256, i); rctx.stroke();
      rctx.beginPath(); rctx.moveTo(i, 0); rctx.lineTo(i, 256); rctx.stroke();
    }
    const roadTex = new THREE.CanvasTexture(roadCvs);
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(18, 36);

    const roadPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 160),
      new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.92, metalness: 0.04, color: 0x080809 })
    );
    roadPlane.rotation.x = -Math.PI / 2;
    roadPlane.position.y = 0;
    scene.add(roadPlane);

    // ── Car groups ──
    const carRoot = new THREE.Group(); // world position + yaw
    scene.add(carRoot);
    const carBody = new THREE.Group(); // suspension roll / pitch
    carRoot.add(carBody);

    let carModel   = null;
    let wheelBones = { lf: null, rf: null, lr: null, rr: null };
    let steeringWheel = null;
    let isLoaded = false;

    // ── State ──
    const state = {
      mouseX: 0, mouseY: 0,
      targetMouseX: 0, targetMouseY: 0,
      dragRotX: 0, dragRotY: 0,
      targetDragRotX: 0, targetDragRotY: 0,
      isDragging: false,
      prevPointerX: 0, prevPointerY: 0,
      scrollProgress: 0, targetScrollProgress: 0,
      wheelRotation: 0,
      holding: false, holdTime: 0, vibrateAmt: 0,
      speed: 0, launchBoost: 0, roadOffset: 0
    };

    const shakeIds = ['nav', 's1-headline', 's1-sub', 's1-scroll', 's1-stats', 's1-box', 's1-cta'];

    // ── Load GLB ──
    const loader = new THREE.GLTFLoader();

    loader.load(
      'porsche_992_gt3_rs.glb',
      function (gltf) {
        carModel = gltf.scene;

        carModel.traverse(child => {
          if (!child.isMesh) return;

          // Apply envMap at low intensity so IBL reflections complement
          // the baked textures without overriding them
          if (child.material) {
            // Handle array materials
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
              // Ensure sRGB encoding on any texture already set by the loader
              if (mat.map)               mat.map.encoding = THREE.sRGBEncoding;
              if (mat.emissiveMap)        mat.emissiveMap.encoding = THREE.sRGBEncoding;

              // Low envMapIntensity so baked colours show through clearly
              mat.envMapIntensity = 0.35;

              // Correct glass / windscreen
              if (/glass|window/i.test(child.name) ||
                  (mat.name && /trans/i.test(mat.name))) {
                mat.transparent  = true;
                mat.opacity      = 0.48;
                mat.roughness    = 0.04;
                mat.metalness    = 0.08;
                mat.envMapIntensity = 0.9; // glass needs more reflection
              }

              mat.needsUpdate = true;
            });
          }

          // Find wheel and steering nodes by name
          const n = child.name || '';
          if (/^wheel_lf/i.test(n) && !wheelBones.lf)  wheelBones.lf = child;
          if (/^wheel_rf/i.test(n) && !wheelBones.rf)  wheelBones.rf = child;
          if (/^wheel_lr/i.test(n) && !wheelBones.lr)  wheelBones.lr = child;
          if (/^wheel_rr/i.test(n) && !wheelBones.rr)  wheelBones.rr = child;
          if (/steeringwheel/i.test(n) && !steeringWheel) steeringWheel = child;
        });

        // Centre bounding box at ground level
        const box    = new THREE.Box3().setFromObject(carModel);
        const centre = box.getCenter(new THREE.Vector3());
        carModel.position.x = -centre.x;
        carModel.position.z = -centre.z;
        carModel.position.y = -box.min.y; // wheels touch ground
        carBody.add(carModel);

        isLoaded = true;

        // Fade out loader
        if (window.gsap) {
          window.gsap.to(loaderHUD, { opacity: 0, duration: 0.55, ease: 'power2.out', onComplete: () => loaderHUD.remove() });
        } else {
          loaderHUD.style.opacity = '0';
          setTimeout(() => loaderHUD.remove(), 550);
        }
      },
      xhr => {
        if (xhr.total > 0) {
          const pct = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          const fill = document.getElementById('porsche-loader-fill');
          const txt  = document.getElementById('porsche-loader-pct');
          if (fill) fill.style.width = pct + '%';
          if (txt)  txt.textContent  = `LOADING · ${pct}%`;
        }
      },
      err => console.warn('GLTFLoader error:', err)
    );

    // ── Input events ──
    window.addEventListener('mousemove', e => {
      state.targetMouseX = (e.clientX / width)  * 2 - 1;
      state.targetMouseY = -(e.clientY / height) * 2 + 1;
      if (state.isDragging) {
        const dx = e.clientX - state.prevPointerX;
        const dy = e.clientY - state.prevPointerY;
        state.targetDragRotY += dx * 0.008;
        state.targetDragRotX += dy * 0.006;
        state.prevPointerX = e.clientX;
        state.prevPointerY = e.clientY;
      }
    });

    window.addEventListener('mousedown', e => {
      if (e.target.closest('#nav') || e.target.closest('button') || e.target.closest('a')) return;
      if (e.target.closest('#hero-section')) {
        state.isDragging = true;
        state.holding    = true;
        state.holdTime   = 0;
        state.prevPointerX = e.clientX;
        state.prevPointerY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      if (state.holding) {
        state.launchBoost = Math.min(1, state.holdTime * 0.4);
        shakeIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.style.transform = ''; el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'; }
        });
      }
      state.isDragging = false;
      state.holding    = false;
      state.vibrateAmt = 0;
    });

    // Touch equivalents
    window.addEventListener('touchstart', e => {
      const t = e.touches[0];
      if (e.target.closest('#hero-section')) {
        state.isDragging = true;
        state.holding    = true;
        state.holdTime   = 0;
        state.prevPointerX = t.clientX;
        state.prevPointerY = t.clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      if (state.isDragging) {
        state.targetDragRotY += (t.clientX - state.prevPointerX) * 0.008;
        state.prevPointerX = t.clientX;
        state.prevPointerY = t.clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      state.isDragging = false;
      state.holding    = false;
      state.vibrateAmt = 0;
    });

    // ── ScrollTrigger — drive progress from the 500vh #hero-section ──
    // Because #hero-pin-wrap is position:sticky, the viewport stays put;
    // we just read progress from the scroll position of #hero-section.
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-section',
        start:   'top top',
        end:     'bottom bottom', // = end of the 500vh section
        scrub:   0.8,
        onUpdate: self => {
          state.targetScrollProgress = self.progress;
        }
      });
    } else {
      // Fallback: drive from raw scroll
      const heroEl = document.getElementById('hero-section');
      if (heroEl) {
        const update = () => {
          const rect  = heroEl.getBoundingClientRect();
          const total = heroEl.offsetHeight - window.innerHeight;
          state.targetScrollProgress = Math.max(0, Math.min(1, -rect.top / total));
        };
        window.addEventListener('scroll', update, { passive: true });
      }
    }

    // ── Animation Loop ──
    let lastTime    = performance.now();
    let prevProgress = 0;

    function animate() {
      requestAnimationFrame(animate);

      const now   = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Smooth lerps
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;
      state.dragRotX += (state.targetDragRotX - state.dragRotX) * 0.08;
      state.dragRotY += (state.targetDragRotY - state.dragRotY) * 0.08;
      state.scrollProgress += (state.targetScrollProgress - state.scrollProgress) * 0.1;

      const p = state.scrollProgress;
      const progressDelta = p - prevProgress;
      prevProgress = p;

      // Decay drag when not interacting
      if (!state.isDragging) {
        state.targetDragRotX *= 0.92;
        state.targetDragRotY *= 0.92;
      }

      // ── Driving Choreography ──
      // Phase 1 (0.00 → 0.35): Front 3/4 → acceleration arc
      // Phase 2 (0.35 → 0.75): Side-profile sweep
      // Phase 3 (0.75 → 1.00): Rear 3/4 / power drift exit
      let tgtX = 0, tgtZ = 0, tgtRotY = -0.45, tgtRotX = 0, tgtRotZ = 0, tgtSteer = state.mouseX * 0.28;

      if (p < 0.35) {
        const t = p / 0.35;
        tgtX    = Math.sin(t * Math.PI * 0.5) * 0.65;
        tgtZ    = t * 1.1;
        tgtRotY = -0.45 - t * 0.45;
        tgtRotX = -0.02 * Math.sin(t * Math.PI);
        tgtRotZ =  0.03 * Math.sin(t * Math.PI);
        tgtSteer = -0.22 * (1 - t) + state.mouseX * 0.18;
      } else if (p < 0.75) {
        const t = (p - 0.35) / 0.40;
        tgtX    = 0.65 - t * 0.45;
        tgtZ    = 1.1  + t * 0.75;
        tgtRotY = -0.90 - t * 0.95;
        tgtRotX =  0.01;
        tgtRotZ = -0.03 * Math.sin(t * Math.PI);
        tgtSteer = 0.18 * Math.sin(t * Math.PI) + state.mouseX * 0.14;
      } else {
        const t = (p - 0.75) / 0.25;
        tgtX    =  0.2 - t * 1.1;
        tgtZ    =  1.85 - t * 2.5;
        tgtRotY = -1.85 - t * 0.72;
        tgtRotX =  0.025 * t;
        tgtRotZ =  0.035 * (1 - t);
        tgtSteer = 0.25 * (1 - t);
      }

      // Apply car transforms
      carRoot.position.set(tgtX, 0, tgtZ);
      carRoot.rotation.y = tgtRotY + state.dragRotY;
      carRoot.rotation.x = state.dragRotX;
      carBody.rotation.x = tgtRotX + state.mouseY * 0.012;
      carBody.rotation.z = tgtRotZ - state.mouseX * 0.022;

      // Shadow tracks car
      shadowPlane.position.x = carRoot.position.x;
      shadowPlane.position.z = carRoot.position.z;
      shadowPlane.rotation.z = carRoot.rotation.y;

      // ── Wheels ──
      const scrollSpeed = Math.abs(progressDelta) * 100;
      const idleSpeed   = (p > 0.01 && p < 0.99) ? 0.7 : 0.05;
      state.speed = scrollSpeed + idleSpeed + state.launchBoost * 14;
      state.launchBoost *= 0.93;

      const wDelta = state.speed * delta * 8;
      state.wheelRotation += wDelta;

      if (wheelBones.lf) { wheelBones.lf.rotation.x = state.wheelRotation; wheelBones.lf.rotation.z = tgtSteer; }
      if (wheelBones.rf) { wheelBones.rf.rotation.x = state.wheelRotation; wheelBones.rf.rotation.z = tgtSteer; }
      if (wheelBones.lr)   wheelBones.lr.rotation.x = state.wheelRotation;
      if (wheelBones.rr)   wheelBones.rr.rotation.x = state.wheelRotation;
      if (steeringWheel)   steeringWheel.rotation.z = tgtSteer * 2.6;

      // Road scroll
      state.roadOffset += wDelta * 0.018;
      roadTex.offset.y  = -state.roadOffset;

      // ── Launch Control Shake ──
      if (state.holding) {
        state.holdTime  += delta;
        state.vibrateAmt = Math.min(0.022, 0.004 + state.holdTime * 0.007);
        carBody.position.set(
          (Math.random() - 0.5) * state.vibrateAmt,
          (Math.random() - 0.5) * state.vibrateAmt,
          (Math.random() - 0.5) * state.vibrateAmt
        );
        tailGlow.intensity = 10 + Math.random() * 4;
        const sx = (Math.random() - 0.5) * 6 * (state.vibrateAmt * 50);
        const sy = (Math.random() - 0.5) * 6 * (state.vibrateAmt * 50);
        shakeIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`; el.style.transition = 'none'; }
        });
      } else {
        carBody.position.set(0, 0, 0);
        tailGlow.intensity = 8;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Resize ──
    window.addEventListener('resize', () => {
      width  = window.innerWidth;
      height = window.innerHeight;
      const cfg = getCameraConfig();
      camera.fov      = cfg.fov;
      camera.position.set(0, cfg.y, cfg.z);
      camera.aspect   = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(getDPR());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPorscheHero);
  } else {
    initPorscheHero();
  }
})();
