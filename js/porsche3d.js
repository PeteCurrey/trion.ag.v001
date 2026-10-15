/* ============================================================
   PORSCHE3D.JS — Three.js WebGL 3D Porsche 992 GT3 RS
   Realistic automotive physics, scroll-driven driving movement,
   wheel rotation, steering, launch control rev, and dynamic reflections.
   ============================================================ */

(function () {
  'use strict';

  function initPorscheHero() {
    const wrap = document.getElementById('trionn-symbol-canvas-wrap');
    if (!wrap || !window.THREE) return;

    const THREE = window.THREE;
    let width = wrap.clientWidth || window.innerWidth;
    let height = wrap.clientHeight || window.innerHeight;

    function getDPR() {
      return Math.min(window.devicePixelRatio || 1, width < 768 ? 1.25 : 1.5);
    }

    // ── Create Minimalist Loading HUD ──
    const loaderHUD = document.createElement('div');
    loaderHUD.id = 'porsche-loader';
    loaderHUD.innerHTML = `
      <div class="porsche-loader-inner">
        <div class="porsche-loader-title">PORSCHE 992 GT3 RS</div>
        <div class="porsche-loader-bar-bg">
          <div class="porsche-loader-bar-fill" id="porsche-loader-fill"></div>
        </div>
        <div class="porsche-loader-sub" id="porsche-loader-pct">PREPARING 3D VEHICLE · 0%</div>
      </div>
    `;
    wrap.appendChild(loaderHUD);

    // ── Three.js Scene Setup ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0C0C0C);
    scene.fog = new THREE.FogExp2(0x0C0C0C, 0.04);

    function getCameraConfig() {
      if (width >= 1440) return { fov: 38, y: 0.95, z: 5.6 };
      if (width >= 1024) return { fov: 40, y: 1.0, z: 6.2 };
      if (width >= 768)  return { fov: 44, y: 1.05, z: 7.2 };
      return { fov: 48, y: 1.15, z: 8.4 };
    }

    const camCfg = getCameraConfig();
    const camera = new THREE.PerspectiveCamera(camCfg.fov, width / height, 0.1, 150);
    camera.position.set(0, camCfg.y, camCfg.z);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getDPR());
    renderer.setClearColor(0x0C0C0C, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if (renderer.outputEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
    wrap.appendChild(renderer.domElement);

    // ── Procedural Studio Environment Reflection Map ──
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x08080a);
    // Overhead white softbox light strip
    const lightGeo = new THREE.PlaneGeometry(16, 4);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const softboxTop = new THREE.Mesh(lightGeo, lightMat);
    softboxTop.position.set(0, 5, 0);
    softboxTop.rotation.x = Math.PI / 2;
    envScene.add(softboxTop);

    // Side softbox light strips for rim reflections
    const softboxL = new THREE.Mesh(new THREE.PlaneGeometry(14, 2), new THREE.MeshBasicMaterial({ color: 0xaaccff, side: THREE.DoubleSide }));
    softboxL.position.set(-6, 2, 0);
    softboxL.rotation.y = Math.PI / 2;
    envScene.add(softboxL);

    const softboxR = new THREE.Mesh(new THREE.PlaneGeometry(14, 2), new THREE.MeshBasicMaterial({ color: 0xffeedd, side: THREE.DoubleSide }));
    softboxR.position.set(6, 2, 0);
    softboxR.rotation.y = -Math.PI / 2;
    envScene.add(softboxR);

    const envRenderTarget = pmremGenerator.fromScene(envScene, 0.04);
    scene.environment = envRenderTarget.texture;

    // ── Studio Lights ──
    const ambientLight = new THREE.AmbientLight(0x28303f, 2.2);
    scene.add(ambientLight);

    const mainTopLight = new THREE.DirectionalLight(0xffffff, 2.6);
    mainTopLight.position.set(2, 6, 3);
    scene.add(mainTopLight);

    const rimLightBack = new THREE.DirectionalLight(0x7fb5ff, 3.2);
    rimLightBack.position.set(-4, 3, -5);
    scene.add(rimLightBack);

    const keyLightFront = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLightFront.position.set(-3, 2, 4);
    scene.add(keyLightFront);

    const sideFill = new THREE.DirectionalLight(0x99aacc, 1.2);
    sideFill.position.set(5, 1, 0);
    scene.add(sideFill);

    // Headlight spot flare
    const headlampL = new THREE.SpotLight(0xffffff, 2.5, 15, Math.PI / 6, 0.5);
    headlampL.position.set(-0.7, 0.45, 2.3);
    headlampL.target.position.set(-0.7, 0, 10);
    scene.add(headlampL);
    scene.add(headlampL.target);

    const headlampR = new THREE.SpotLight(0xffffff, 2.5, 15, Math.PI / 6, 0.5);
    headlampR.position.set(0.7, 0.45, 2.3);
    headlampR.target.position.set(0.7, 0, 10);
    scene.add(headlampR);
    scene.add(headlampR.target);

    // Taillight red glow
    const tailGlow = new THREE.PointLight(0xff1100, 3.5, 6);
    tailGlow.position.set(0, 0.7, -2.4);
    scene.add(tailGlow);

    // ── Ground Contact Shadow & Road Surface ──
    // Contact shadow canvas texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(256, 256, 40, 256, 256, 250);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0.6)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 3.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.9, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // Asphalt ground plane with subtle speed grid
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 256;
    roadCanvas.height = 256;
    const rctx = roadCanvas.getContext('2d');
    rctx.fillStyle = '#0a0a0c';
    rctx.fillRect(0, 0, 256, 256);
    rctx.strokeStyle = 'rgba(255,255,255,0.025)';
    rctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 32) {
      rctx.beginPath();
      rctx.moveTo(0, i);
      rctx.lineTo(256, i);
      rctx.stroke();
      rctx.beginPath();
      rctx.moveTo(i, 0);
      rctx.lineTo(i, 256);
      rctx.stroke();
    }
    const roadTex = new THREE.CanvasTexture(roadCanvas);
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(20, 40);

    const roadPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 160),
      new THREE.MeshStandardMaterial({
        map: roadTex,
        roughness: 0.85,
        metalness: 0.1,
        color: 0x09090b
      })
    );
    roadPlane.rotation.x = -Math.PI / 2;
    roadPlane.position.y = 0;
    scene.add(roadPlane);

    // ── Car Container Group ──
    const carRoot = new THREE.Group();
    scene.add(carRoot);

    // Sub-group for suspension roll & pitch
    const carBody = new THREE.Group();
    carRoot.add(carBody);

    // References to car components
    let carModel = null;
    let wheelBones = {
      lf: null,
      rf: null,
      lr: null,
      rr: null
    };
    let steeringWheel = null;
    let emissiveMeshes = [];
    let isLoaded = false;

    // ── Interaction State ──
    const state = {
      mouseX: 0,
      mouseY: 0,
      targetMouseX: 0,
      targetMouseY: 0,
      dragRotX: 0,
      dragRotY: 0,
      targetDragRotX: 0,
      targetDragRotY: 0,
      isDragging: false,
      prevPointerX: 0,
      prevPointerY: 0,
      scrollProgress: 0,
      targetScrollProgress: 0,
      wheelRotation: 0,
      steeringAngle: 0,
      holding: false,
      holdTime: 0,
      vibrateAmt: 0,
      speed: 0,
      launchBoost: 0,
      roadOffset: 0
    };

    const shakeElementIds = ['nav', 's1-headline', 's1-sub', 's1-scroll', 's1-stats', 's1-box', 's1-cta'];

    // ── Load Porsche 992 GT3 RS Model ──
    const loader = new THREE.GLTFLoader();

    loader.load(
      'porsche_992_gt3_rs.glb',
      function (gltf) {
        carModel = gltf.scene;

        // Traverse model to tune materials, shadows, and find wheel/steering nodes
        carModel.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.material.envMap = envRenderTarget.texture;
              child.material.envMapIntensity = 1.4;

              // Enhance glass transparency
              if (/glass|window/i.test(child.name) || /trans/i.test(child.material.name)) {
                child.material.transparent = true;
                child.material.opacity = 0.55;
                child.material.roughness = 0.05;
                child.material.metalness = 0.1;
              }

              // Enhance car paint / metallic clearcoat
              if (/bodyshell/i.test(child.name)) {
                child.material.roughness = Math.min(child.material.roughness || 0.3, 0.25);
                child.material.metalness = Math.max(child.material.metalness || 0.6, 0.7);
              }

              // Emissive lightbars
              if (/brake|light|lamp|indicator/i.test(child.name) || (child.material.emissive && child.material.emissive.r > 0.1)) {
                emissiveMeshes.push(child);
              }
            }
          }

          // Locate rigged wheel bones and steering wheel
          const name = child.name || '';
          if (/wheel_lf/i.test(name) && !wheelBones.lf) wheelBones.lf = child;
          if (/wheel_rf/i.test(name) && !wheelBones.rf) wheelBones.rf = child;
          if (/wheel_lr/i.test(name) && !wheelBones.lr) wheelBones.lr = child;
          if (/wheel_rr/i.test(name) && !wheelBones.rr) wheelBones.rr = child;
          if (/steeringwheel/i.test(name) && !steeringWheel) steeringWheel = child;
        });

        // Compute bounding box and center the model
        const box = new THREE.Box3().setFromObject(carModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center on X and Z, set bottom of tires at ground level y = 0
        carModel.position.x = -center.x;
        carModel.position.z = -center.z;
        carModel.position.y = -box.min.y;

        carBody.add(carModel);

        // Adjust shadow plane position under centered car
        shadowPlane.position.x = 0;
        shadowPlane.position.z = 0;

        isLoaded = true;

        // Animate out loader HUD
        if (window.gsap) {
          window.gsap.to(loaderHUD, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => loaderHUD.remove()
          });
        } else {
          loaderHUD.style.opacity = '0';
          setTimeout(() => loaderHUD.remove(), 600);
        }

        // Trigger hero element reveal if not already visible
        const s1Headline = document.getElementById('s1-headline');
        if (s1Headline) s1Headline.style.visibility = 'visible';
      },
      function (xhr) {
        if (xhr.total && xhr.total > 0) {
          const pct = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          const fill = document.getElementById('porsche-loader-fill');
          const txt = document.getElementById('porsche-loader-pct');
          if (fill) fill.style.width = pct + '%';
          if (txt) txt.textContent = `LOADING PORSCHE GT3 RS · ${pct}%`;
        }
      },
      function (err) {
        console.warn('Porsche GLTF Loader error:', err);
        const txt = document.getElementById('porsche-loader-pct');
        if (txt) txt.textContent = 'ERROR LOADING VEHICLE';
      }
    );

    // ── Mouse & Touch Event Listeners ──
    window.addEventListener('mousemove', e => {
      state.targetMouseX = (e.clientX / width) * 2 - 1;
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
      if (e.target.closest('#hero-section') && !e.target.closest('#keyfacts-section')) {
        state.isDragging = true;
        state.holding = true;
        state.holdTime = 0;
        state.prevPointerX = e.clientX;
        state.prevPointerY = e.clientY;

        // Update stats label to Launch Control
        const statsEl = document.getElementById('s1-stats');
        if (statsEl) {
          const title = statsEl.querySelector('.title');
          if (title) title.innerHTML = '⚡ LAUNCH CONTROL ACTIVE ⚡';
        }
      }
    });

    window.addEventListener('mouseup', () => {
      state.isDragging = false;
      if (state.holding) {
        state.holding = false;
        // Release burst boost
        state.launchBoost = Math.min(1.0, state.holdTime * 0.4);
        state.vibrateAmt = 0;

        // Reset stats label
        const statsEl = document.getElementById('s1-stats');
        if (statsEl) {
          const title = statsEl.querySelector('.title');
          if (title) title.innerHTML = 'hold to&nbsp;⚡&nbsp;blast';
        }

        shakeElementIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.transform = 'translate(0,0)';
            el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          }
        });
      }
    });

    // ── Scroll Progress via ScrollTrigger ──
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: self => {
          state.targetScrollProgress = self.progress;
        }
      });
    }

    // ── Animation Loop ──
    let lastTime = performance.now();
    let prevProgress = 0;

    function animate() {
      requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Smooth interpolations
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;
      state.dragRotX += (state.targetDragRotX - state.dragRotX) * 0.08;
      state.dragRotY += (state.targetDragRotY - state.dragRotY) * 0.08;
      state.scrollProgress += (state.targetScrollProgress - state.scrollProgress) * 0.1;

      const p = state.scrollProgress;
      const progressDelta = p - prevProgress;
      prevProgress = p;

      // ── Real Movement Calculations Along Driving Path ──
      // Dynamic trajectory choreography:
      // p = 0.0 -> Parked beauty angle (front 3/4)
      // p = 0.3 -> Acceleration roll, front sweeps across
      // p = 0.6 -> Sleek side profile showcase
      // p = 0.85 -> Power drift / rear 3/4 view showcasing wing, diffuser, and taillight
      // p = 1.0 -> Glides forward towards About section

      let targetX = 0;
      let targetZ = 0;
      let targetY = 0;
      let targetRotY = -0.45; // Initial front 3/4 beauty angle
      let targetRotX = 0;
      let targetRotZ = 0;
      let targetSteer = state.mouseX * 0.32; // Front steering

      if (p < 0.35) {
        // Phase 1: Acceleration & Arc Turn
        const t = p / 0.35;
        targetX = Math.sin(t * Math.PI * 0.5) * 0.7;
        targetZ = t * 1.2;
        targetRotY = -0.45 + t * -0.45; // Rotate to -0.90 rad (~-52°)
        targetRotX = -0.02 * Math.sin(t * Math.PI); // Rear squat under acceleration
        targetRotZ = 0.03 * Math.sin(t * Math.PI); // Body roll into turn
        targetSteer = -0.25 * (1 - t) + state.mouseX * 0.2;
      } else if (p < 0.75) {
        // Phase 2: Dynamic Side Profile Tracking Shot
        const t = (p - 0.35) / 0.40;
        targetX = 0.7 - t * 0.5;
        targetZ = 1.2 + t * 0.8;
        targetRotY = -0.90 - t * 0.95; // Rotate to -1.85 rad (~-106°, wide side-profile)
        targetRotX = 0.01;
        targetRotZ = -0.03 * Math.sin(t * Math.PI);
        targetSteer = 0.2 * Math.sin(t * Math.PI) + state.mouseX * 0.15;
      } else {
        // Phase 3: Aggressive Rear 3/4 Drift & Exit
        const t = (p - 0.75) / 0.25;
        targetX = 0.2 - t * 1.2;
        targetZ = 2.0 - t * 2.8;
        targetRotY = -1.85 - t * 0.75; // Rotate to -2.60 rad (~-150°, dramatic rear wing view)
        targetRotX = 0.03 * t; // Front dips as it decelerates/drifts
        targetRotZ = 0.04 * (1 - t);
        targetSteer = 0.28 * (1 - t); // Counter-steer into drift
      }

      // Add user drag offset (damped back to 0 when not dragging)
      if (!state.isDragging) {
        state.targetDragRotX *= 0.92;
        state.targetDragRotY *= 0.92;
      }

      // ── Apply Transforms to Car ──
      carRoot.position.x = targetX;
      carRoot.position.z = targetZ;
      carRoot.position.y = targetY;

      // Base yaw rotation + drag
      carRoot.rotation.y = targetRotY + state.dragRotY;
      carRoot.rotation.x = state.dragRotX;

      // Body suspension pitch & roll
      carBody.rotation.x = targetRotX + state.mouseY * 0.015;
      carBody.rotation.z = targetRotZ - state.mouseX * 0.025;

      // Shadow follows car
      shadowPlane.position.x = carRoot.position.x;
      shadowPlane.position.z = carRoot.position.z;
      shadowPlane.rotation.z = carRoot.rotation.y;

      // ── Wheel Rotation & Speed ──
      const scrollSpeed = Math.abs(progressDelta) * 120;
      const baseSpeed = (p > 0.02 && p < 0.98) ? 0.8 : 0.05;
      state.speed = scrollSpeed + baseSpeed + state.launchBoost * 15;

      // Decay launch boost
      state.launchBoost *= 0.94;

      // Rotate wheel bones on local axle axis (X axis in Three.js)
      const wheelDelta = state.speed * delta * 8;
      state.wheelRotation += wheelDelta;

      if (wheelBones.lf) {
        wheelBones.lf.rotation.x = state.wheelRotation;
        wheelBones.lf.rotation.z = targetSteer; // Steering angle
      }
      if (wheelBones.rf) {
        wheelBones.rf.rotation.x = state.wheelRotation;
        wheelBones.rf.rotation.z = targetSteer;
      }
      if (wheelBones.lr) {
        wheelBones.lr.rotation.x = state.wheelRotation;
      }
      if (wheelBones.rr) {
        wheelBones.rr.rotation.x = state.wheelRotation;
      }

      // Cockpit steering wheel rotation
      if (steeringWheel) {
        steeringWheel.rotation.z = targetSteer * 2.8;
      }

      // Scroll road texture backward
      state.roadOffset += wheelDelta * 0.02;
      roadTex.offset.y = -state.roadOffset;

      // ── Hold to Rev / Launch Control Shake ──
      if (state.holding) {
        state.holdTime += delta;
        state.vibrateAmt = Math.min(0.025, 0.005 + state.holdTime * 0.008);

        // High frequency chassis rumble
        const jx = (Math.random() - 0.5) * state.vibrateAmt;
        const jy = (Math.random() - 0.5) * state.vibrateAmt;
        const jz = (Math.random() - 0.5) * state.vibrateAmt;
        carBody.position.set(jx, jy, jz);

        // Taillight intensifies
        tailGlow.intensity = 6.0 + Math.random() * 2.0;

        // Screen shake
        const sx = (Math.random() - 0.5) * 8 * (state.vibrateAmt * 50);
        const sy = (Math.random() - 0.5) * 8 * (state.vibrateAmt * 50);
        shakeElementIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
            el.style.transition = 'none';
          }
        });
      } else {
        carBody.position.set(0, 0, 0);
        tailGlow.intensity = 3.5;
      }

      // Render Three.js Scene
      renderer.render(scene, camera);
    }

    animate();

    // ── Responsive Resize Handler ──
    window.addEventListener('resize', () => {
      width = wrap.clientWidth || window.innerWidth;
      height = wrap.clientHeight || window.innerHeight;

      const cfg = getCameraConfig();
      camera.fov = cfg.fov;
      camera.position.y = cfg.y;
      camera.position.z = cfg.z;
      camera.aspect = width / height;
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
