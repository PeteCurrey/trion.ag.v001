/* ============================================================
   SYMBOL3D.JS — Three.js WebGL 3D TRIONN Symbol Animation
   Exact extruded logo geometry, interactive rotation, hold-to-blast,
   scroll-based explosion, and dynamic electrical bezier arcs.
   ============================================================ */

(function () {
  'use strict';

  function initTrionnSymbol() {
    const wrap = document.getElementById('trionn-symbol-canvas-wrap');
    if (!wrap || !window.THREE) return;

    const THREE = window.THREE;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function getDPR() {
      return Math.min(window.devicePixelRatio || 1, width < 768 ? 1 : 1.5);
    }

    // ── 2D Canvas for Electric Arc Lines ──
    const lineCanvas = document.createElement('canvas');
    lineCanvas.width = width;
    lineCanvas.height = height;
    lineCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
    wrap.appendChild(lineCanvas);
    const lctx = lineCanvas.getContext('2d');

    // ── Three.js Scene Setup ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0C0C0C);

    function getCameraConfig() {
      if (width > 1440) return { fov: 42, z: 6, sx: 1, x: 0, y: 0 };
      if (width >= 1024) return { fov: 40, z: 6.28, sx: 0.9, x: 0, y: -0.02 };
      if (width >= 768)  return { fov: 38, z: 7.55, sx: 0.84, x: 0, y: -0.035 };
      return { fov: 36, z: 9.35, sx: 0.74, x: 0, y: -0.055 };
    }

    const camCfg = getCameraConfig();
    const camera = new THREE.PerspectiveCamera(camCfg.fov, width / height, 0.1, 200);
    camera.position.set(0, 0, camCfg.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getDPR());
    renderer.setClearColor(0x0C0C0C, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
    wrap.appendChild(renderer.domElement);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x2a3040, 2.8));

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8899aa, 0.8);
    dirLight2.position.set(-4, 1, -2);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xccddee, 1.5);
    dirLight3.position.set(0, -3, -5);
    scene.add(dirLight3);

    const pointLight1 = new THREE.PointLight(0xff3300, 10, 20);
    pointLight1.position.set(3, -1, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0088ff, 8, 18);
    pointLight2.position.set(-3, 2, -2);
    scene.add(pointLight2);

    // ── Shapes (Exact Bézier Curves from Original Symbol) ──
    function createShape(fn) {
      const s = new THREE.Shape();
      fn(s);
      return s;
    }

    const shape1 = createShape(e => {
      e.moveTo(-0.140182, -0.2239285);
      e.bezierCurveTo(-0.1261855, -0.2239285, -0.113243, -0.2163645, -0.106392, -0.204135);
      e.lineTo(-0.0132215, -0.038037);
      e.bezierCurveTo(0.001271, -0.0121985, -0.0174065, 0.0196695, -0.047027, 0.0196695);
      e.lineTo(-0.4300165, 0.0196695);
      e.bezierCurveTo(-0.4598385, 0.0196695, -0.478485, 0.0519715, -0.4635585, 0.07781);
      e.lineTo(0.1073065, 1.065563);
      e.bezierCurveTo(0.114111, 1.0773585, 0.114235, 1.0918665, 0.1076165, 1.1037705);
      e.lineTo(0.013516, 1.2732165);
      e.bezierCurveTo(-0.001116, 1.2995355, -0.0388585, 1.299861, -0.053909, 1.2737745);
      e.lineTo(-0.7673585, 0.039029);
      e.bezierCurveTo(-0.774287, 0.0270475, -0.78709, 0.0196695, -0.8009315, 0.0196695);
      e.lineTo(-1.2267785, 0.0196695);
      e.bezierCurveTo(-1.2403875, 0.0196695, -1.2530045, 0.0125395, -1.2600105, 0.000868);
      e.lineTo(-1.359753, -0.16523);
      e.bezierCurveTo(-1.375253, -0.191053, -1.356653, -0.2239285, -1.3265365, -0.2239285);
      e.lineTo(-0.140182, -0.2239285);
      e.closePath();
    });

    const shape2 = createShape(e => {
      e.moveTo(0.655185, 0.5729575);
      e.bezierCurveTo(0.648272, 0.584908, 0.648241, 0.5996175, 0.6551075, 0.611599);
      e.lineTo(0.8809425, 1.005919);
      e.bezierCurveTo(0.887685, 1.0176835, 0.887778, 1.0321295, 0.8811905, 1.043987);
      e.lineTo(0.787028, 1.213526);
      e.bezierCurveTo(0.772396, 1.239845, 0.7346535, 1.2401705, 0.7195875, 1.2140995);
      e.lineTo(0.130789, 0.1955945);
      e.bezierCurveTo(0.123876, 0.183644, 0.123845, 0.1689035, 0.1307425, 0.156922);
      e.lineTo(0.2290435, -0.014322);
      e.bezierCurveTo(0.243939, -0.0402845, 0.281418, -0.040269, 0.2962825, -0.0142755);
      e.lineTo(0.470022, 0.2892765);
      e.bezierCurveTo(0.4848865, 0.315239, 0.522319, 0.3152855, 0.5372455, 0.2893385);
      e.lineTo(1.107289, -0.7013285);
      e.bezierCurveTo(1.1142175, -0.713341, 1.1270205, -0.72075, 1.1408775, -0.72075);
      e.lineTo(1.335604, -0.7207655);
      e.bezierCurveTo(1.365426, -0.720781, 1.384088, -0.6884635, 1.369146, -0.662625);
      e.lineTo(0.655185, 0.5729575);
      e.closePath();
    });

    const shape3 = createShape(e => {
      e.moveTo(0.2825805, -0.599881);
      e.bezierCurveTo(0.2973675, -0.625704, 0.2787055, -0.6578665, 0.2489455, -0.6578665);
      e.lineTo(-0.900178, -0.6578665);
      e.bezierCurveTo(-0.9137715, -0.6578665, -0.9263885, -0.665012, -0.9333945, -0.676668);
      e.lineTo(-1.033137, -0.8427815);
      e.bezierCurveTo(-1.0486525, -0.8686045, -1.030037, -0.9014645, -0.9999205, -0.9014645);
      e.lineTo(0.433659, -0.9014645);
      e.bezierCurveTo(0.4475625, -0.9014645, 0.460412, -0.90892, 0.4673095, -0.92101);
      e.lineTo(0.691486, -1.31347);
      e.bezierCurveTo(0.6983835, -1.3255445, 0.7112175, -1.333, 0.7251365, -1.333);
      e.lineTo(0.9199715, -1.333);
      e.bezierCurveTo(0.9497625, -1.333, 0.968409, -1.3007755, 0.9535755, -1.2749525);
      e.lineTo(0.361491, -0.2442025);
      e.bezierCurveTo(0.3545625, -0.232159, 0.3417595, -0.22475, 0.327887, -0.22475);
      e.lineTo(0.1348655, -0.22475);
      e.bezierCurveTo(0.1051055, -0.22475, 0.0864435, -0.2569125, 0.1012305, -0.2827355);
      e.lineTo(0.2825805, -0.599881);
      e.closePath();
    });

    const extrudeSettings = {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.01,
      bevelSegments: 2
    };

    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x272a2e,
      emissive: new THREE.Color(0x111418),
      emissiveIntensity: 0.2,
      metalness: 0.85,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      side: THREE.DoubleSide
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x556070,
      transparent: true,
      opacity: 0.35
    });

    const symbolGroup = new THREE.Group();
    const parts = [];

    const shapes = [shape1, shape2, shape3];
    const explodeDirs = [
      new THREE.Vector3(-0.6, 0.4, 0.2).normalize(),
      new THREE.Vector3(0.7, 0.3, -0.3).normalize(),
      new THREE.Vector3(0.0, -0.8, 0.4).normalize()
    ];

    shapes.forEach((s, idx) => {
      const geom = new THREE.ExtrudeGeometry(s, extrudeSettings);
      geom.computeBoundingBox();
      const center = new THREE.Vector3();
      geom.boundingBox.getCenter(center);

      const mesh = new THREE.Mesh(geom, mainMaterial.clone());
      const edgesGeom = new THREE.EdgesGeometry(geom, 15);
      const wire = new THREE.LineSegments(edgesGeom, edgeMaterial);
      mesh.add(wire);

      symbolGroup.add(mesh);
      parts.push({
        mesh,
        basePos: mesh.position.clone(),
        explodeDir: explodeDirs[idx],
        spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        spinSpeed: (Math.random() - 0.5) * 1.5,
        delay: idx * 0.05
      });
    });

    function applyTransform() {
      const cfg = getCameraConfig();
      symbolGroup.scale.set(cfg.sx, cfg.sx, cfg.sx);
      symbolGroup.position.set(cfg.x, cfg.y, -extrudeSettings.depth / 2);
    }
    applyTransform();
    scene.add(symbolGroup);

    // ── Interaction State ──
    const state = {
      mouseX: 0,
      mouseY: 0,
      rotX: 0.2,
      rotY: 0.3,
      targetRotX: 0.2,
      targetRotY: 0.3,
      dragging: false,
      prevPointerX: 0,
      prevPointerY: 0,
      scrollProgress: 0,
      vibrateAmt: 0,
      holding: false,
      holdTime: 0,
      clickBurst: 0,
      lineTime: 0
    };

    // Target elements to shake on blast
    const shakeElementIds = ['nav', 's1-headline', 's1-sub', 's1-scroll', 's1-stats', 's1-box', 's1-cta'];

    // ── Mouse / Touch Listeners ──
    window.addEventListener('mousemove', e => {
      state.mouseX = (e.clientX / width) * 2 - 1;
      state.mouseY = -(e.clientY / height) * 2 + 1;

      if (state.dragging) {
        const dx = e.clientX - state.prevPointerX;
        const dy = e.clientY - state.prevPointerY;
        state.targetRotY += dx * 0.015;
        state.targetRotX += dy * 0.015;
        state.prevPointerX = e.clientX;
        state.prevPointerY = e.clientY;
      }
    });

    window.addEventListener('mousedown', e => {
      if (e.target.closest('#nav') || e.target.closest('button') || e.target.closest('a')) return;
      if (e.target.closest('#hero-section') && !e.target.closest('#keyfacts-section')) {
        state.dragging = true;
        state.holding = true;
        state.holdTime = 0;
        state.prevPointerX = e.clientX;
        state.prevPointerY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      state.dragging = false;
      state.holding = false;
      state.vibrateAmt = 0;
      shakeElementIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.transform = 'translate(0,0)';
          el.style.transition = 'transform 0.5s ease-out';
        }
      });
    });

    // ── Scroll Progress via ScrollTrigger ──
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
          state.scrollProgress = self.progress;
        }
      });
    }

    // ── Electric Lines Drawing Logic ──
    // Anchors on the 3D symbol projected to 2D
    const anchorPoints = [
      new THREE.Vector3(-0.6, 0.2, 0.2),
      new THREE.Vector3(0.5, 0.5, 0.2),
      new THREE.Vector3(0.3, -0.7, 0.2)
    ];

    function drawElectricArcs(time) {
      lctx.clearRect(0, 0, width, height);

      // Only draw when near the top of the page
      if (state.scrollProgress > 0.4) return;

      const alpha = Math.max(0, 1 - state.scrollProgress * 2.5);

      anchorPoints.forEach((pt, i) => {
        const worldPt = pt.clone().applyMatrix4(symbolGroup.matrixWorld);
        worldPt.project(camera);

        const sx = ((worldPt.x + 1) / 2) * width;
        const sy = ((-worldPt.y + 1) / 2) * height;

        // Target edge connection points
        const targetEdges = [
          { x: 0, y: height * 0.7 },
          { x: width, y: height * 0.25 },
          { x: width * 0.8, y: height }
        ];

        const target = targetEdges[i];
        const midX = (sx + target.x) / 2 + Math.sin(time * 2 + i * 2) * 40;
        const midY = (sy + target.y) / 2 + Math.cos(time * 1.5 + i * 3) * 30;

        // Draw glowing bezier curve
        lctx.save();
        lctx.beginPath();
        lctx.moveTo(target.x, target.y);
        lctx.quadraticCurveTo(midX, midY, sx, sy);
        lctx.strokeStyle = 'rgba(70, 85, 110, ' + (0.35 * alpha) + ')';
        lctx.lineWidth = 1;
        lctx.stroke();

        // Traveling pulse
        const pulseT = ((time * 0.6 + i * 0.33) % 1);
        const invT = 1 - pulseT;
        const px = invT * invT * target.x + 2 * invT * pulseT * midX + pulseT * pulseT * sx;
        const py = invT * invT * target.y + 2 * invT * pulseT * midY + pulseT * pulseT * sy;

        lctx.beginPath();
        lctx.arc(px, py, 2.5, 0, Math.PI * 2);
        lctx.fillStyle = 'rgba(216, 216, 216, ' + (0.85 * alpha) + ')';
        lctx.shadowColor = '#60a5fa';
        lctx.shadowBlur = 8;
        lctx.fill();
        lctx.restore();
      });
    }

    // ── Animation Loop ──
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      state.lineTime += delta;

      // Smooth idle + mouse rotation
      if (!state.dragging) {
        state.targetRotY += 0.003;
        state.targetRotX = THREE.MathUtils.clamp(state.targetRotX, -0.6, 0.6);
      }
      state.rotX += (state.targetRotX + state.mouseY * 0.25 - state.rotX) * 0.06;
      state.rotY += (state.targetRotY + state.mouseX * 0.25 - state.rotY) * 0.06;

      symbolGroup.rotation.x = state.rotX;
      symbolGroup.rotation.y = state.rotY;

      // Point lights orbital movement
      pointLight1.position.x = 3.5 * Math.sin(time * 0.7);
      pointLight1.position.y = 2.0 * Math.cos(time * 0.5);
      pointLight2.position.x = 3.5 * Math.cos(time * 0.6);
      pointLight2.position.y = 2.0 * Math.sin(time * 0.8);

      // Hold to blast logic
      if (state.holding) {
        state.holdTime += delta;
        state.vibrateAmt = Math.min(1, state.holdTime * 1.8);

        if (state.holdTime > 0.6) {
          state.clickBurst = Math.min(1, state.clickBurst + 0.04);
        }

        // Vibrate DOM elements
        const vx = (Math.random() - 0.5) * state.vibrateAmt * 8;
        const vy = (Math.random() - 0.5) * state.vibrateAmt * 8;
        shakeElementIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.transition = 'none';
            el.style.transform = `translate(${vx}px, ${vy}px)`;
          }
        });
      } else {
        state.vibrateAmt = Math.max(0, state.vibrateAmt - 0.05);
        state.clickBurst = Math.max(0, state.clickBurst - 0.03);
      }

      // Explosion displacement (scroll + hold blast)
      const explosionProgress = Math.max(state.scrollProgress * 1.5, state.clickBurst);

      parts.forEach(p => {
        const d = Math.max(0, explosionProgress - p.delay);
        const dist = d * 4.2;

        p.mesh.position.set(
          p.basePos.x + p.explodeDir.x * dist,
          p.basePos.y + p.explodeDir.y * dist,
          p.basePos.z + p.explodeDir.z * dist
        );

        p.mesh.rotation.x = p.spinAxis.x * p.spinSpeed * dist * Math.PI;
        p.mesh.rotation.y = p.spinAxis.y * p.spinSpeed * dist * Math.PI;
        p.mesh.rotation.z = p.spinAxis.z * p.spinSpeed * dist * Math.PI;
      });

      // Render 3D scene
      renderer.render(scene, camera);

      // Render electric arcs
      drawElectricArcs(state.lineTime);
    }

    animate();

    // ── Resize Handler ──
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const cfg = getCameraConfig();
      camera.fov = cfg.fov;
      camera.position.z = cfg.z;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(getDPR());

      lineCanvas.width = width;
      lineCanvas.height = height;

      applyTransform();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrionnSymbol);
  } else {
    initTrionnSymbol();
  }
})();
