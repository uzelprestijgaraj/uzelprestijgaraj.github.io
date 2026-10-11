/* Uzel Prestij Garaj - Firestore araç kartları, sabit 3D sahne ve scroll kamerası. */
(function () {
  'use strict';

  var canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) {
    document.body.classList.add('no-webgl');
    return;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (error) {
    console.error('3D sahne başlatılamadı:', error);
    document.body.classList.add('no-webgl');
    return;
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = 10;
  var GOLD = 0xd4af37;
  var BLUE = 0x2a6df4;
  var N = 5;
  var cars = [];
  var target = 0;
  var prog = 0;

  var fallbackCars = [
    { marka: 'Renault', model: 'Clio', fiyat: 750, renk: 0xc9a227 },
    { marka: 'Fiat', model: 'Egea', fiyat: 900, renk: 0x17191d },
    { marka: 'VW', model: 'Passat', fiyat: 1400, renk: 0xe8e8e4 },
    { marka: 'BMW', model: '3.20', fiyat: 2000, renk: 0x9299a2 },
    { marka: 'Mercedes', model: 'C200', fiyat: 2500, renk: 0x071b3a }
  ];

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x05060a, 1);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060a);
  scene.fog = new THREE.FogExp2(0x05060a, 0.0015);

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(0, 1.6, 15);

  scene.add(new THREE.AmbientLight(0x7d8295, 0.8));
  var keyLight = new THREE.DirectionalLight(0xffe0a0, 1.25);
  keyLight.position.set(-4, 8, 8);
  scene.add(keyLight);

  var lightRig = new THREE.Group();
  var goldLight = new THREE.PointLight(GOLD, 2.6, 34);
  var blueLight = new THREE.PointLight(BLUE, 2.2, 34);
  lightRig.add(goldLight, blueLight);
  scene.add(lightRig);

  var backgroundSphere = new THREE.Mesh(
    new THREE.SphereGeometry(420, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x05060a, side: THREE.BackSide, fog: false })
  );
  backgroundSphere.position.set(0, 0, -((N - 1) * D) / 2);
  backgroundSphere.renderOrder = -10;
  scene.add(backgroundSphere);

  function drawDarkBackground(image) {
    var textureCanvas = document.createElement('canvas');
    textureCanvas.width = 2048;
    textureCanvas.height = 1024;
    var context = textureCanvas.getContext('2d');
    if (!context) return null;
    context.filter = 'blur(10px)';
    context.drawImage(image, -20, -20, 2088, 1064);
    context.filter = 'none';
    context.fillStyle = 'rgba(3, 5, 12, 0.7)';
    context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
    var texture = new THREE.CanvasTexture(textureCanvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    return texture;
  }

  var backgroundImage = new Image();
  backgroundImage.crossOrigin = 'anonymous';
  backgroundImage.onload = function () {
    var texture = drawDarkBackground(backgroundImage);
    if (!texture) return;
    backgroundSphere.material.map = texture;
    backgroundSphere.material.color.set(0xffffff);
    backgroundSphere.material.needsUpdate = true;
  };
  backgroundImage.onerror = function () {
    console.warn('Sahne arka plan görseli yüklenemedi; koyu yedek arka plan kullanılıyor.');
  };
  backgroundImage.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80';

  var particleCount = 360;
  var particlePositions = new Float32Array(particleCount * 3);
  for (var p = 0; p < particleCount; p += 1) {
    particlePositions[p * 3] = (Math.random() - 0.5) * 64;
    particlePositions[p * 3 + 1] = Math.random() * 20 - 2;
    particlePositions[p * 3 + 2] = 20 - Math.random() * (D * 7 + 45);
  }
  var particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  var stars = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0xe4c568, size: 0.055, transparent: true, opacity: 0.62, depthWrite: false })
  );
  stars.renderOrder = -2;
  scene.add(stars);

  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(180, D * 8 + 100),
    new THREE.MeshStandardMaterial({ color: 0x080a11, metalness: 0.45, roughness: 0.62 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.4, -((N - 1) * D) / 2);
  scene.add(floor);

  function vehicleName(data) {
    return [data.marka, data.model].filter(Boolean).join(' ');
  }

  function makeLabelTexture(data) {
    var label = document.createElement('canvas');
    label.width = 1200;
    label.height = 320;
    var context = label.getContext('2d');
    if (!context) throw new Error('Araç etiketi için Canvas 2D context oluşturulamadı.');
    context.fillStyle = 'rgba(5, 7, 12, 0.88)';
    context.fillRect(2, 2, 1196, 316);
    context.strokeStyle = '#d4af37';
    context.lineWidth = 5;
    context.strokeRect(3, 3, 1194, 314);
    context.fillStyle = '#f0d27a';
    context.font = '700 70px Arial, sans-serif';
    context.textAlign = 'left';
    context.fillText(vehicleName(data), 54, 132, 1090);
    context.font = '600 56px Arial, sans-serif';
    context.fillText(new Intl.NumberFormat('tr-TR').format(data.fiyat) + ' TL/gün', 54, 232, 1090);
    var texture = new THREE.CanvasTexture(label);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function addBox(parent, geometry, material, x, y, z) {
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function makeCar(data, index) {
    var car = new THREE.Group();
    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: data.renk,
      metalness: 0.58,
      roughness: 0.3,
      emissive: data.renk,
      emissiveIntensity: 0.025
    });
    var glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x101a29,
      metalness: 0.35,
      roughness: 0.2
    });
    var tireMaterial = new THREE.MeshStandardMaterial({ color: 0x101114, roughness: 0.85 });
    var hubMaterial = new THREE.MeshStandardMaterial({ color: 0xb5b9bf, metalness: 0.8, roughness: 0.25 });
    var headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffe7a3 });
    var tailLightMaterial = new THREE.MeshBasicMaterial({ color: 0xc51f2d });

    addBox(car, new THREE.BoxGeometry(3.7, 0.62, 1.9), bodyMaterial, 0, -0.02, 0);
    addBox(car, new THREE.BoxGeometry(3.28, 0.34, 0.62), bodyMaterial, 0, 0.27, 0.61);
    addBox(car, new THREE.BoxGeometry(3.28, 0.34, 0.48), bodyMaterial, 0, 0.25, -0.69);
    addBox(car, new THREE.BoxGeometry(2.2, 0.72, 1.08), bodyMaterial, 0, 0.56, -0.08);
    addBox(car, new THREE.BoxGeometry(1.98, 0.49, 0.08), glassMaterial, 0, 0.63, 0.49);
    [-1, 1].forEach(function (side) {
      addBox(car, new THREE.BoxGeometry(0.08, 0.45, 0.84), glassMaterial, side * 1.12, 0.62, -0.08);
      [-0.62, 0.62].forEach(function (axle) {
        var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.22, 20), tireMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(side * 1.78, -0.38, axle);
        car.add(wheel);
        var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.235, 16), hubMaterial);
        hub.rotation.z = Math.PI / 2;
        hub.position.copy(wheel.position);
        car.add(hub);
      });
      addBox(car, new THREE.BoxGeometry(0.52, 0.16, 0.06), headlightMaterial, side * 1.24, 0.02, 0.98);
      addBox(car, new THREE.BoxGeometry(0.45, 0.14, 0.06), tailLightMaterial, side * 1.25, 0.04, -0.98);
    });

    car.position.set(-2.25, 0.4, -index * D);
    car.userData = {
      bodyMaterial: bodyMaterial,
      baseRotation: index % 2 === 0 ? 0.035 : -0.035,
      glow: new THREE.PointLight(GOLD, 0, 12)
    };
    car.userData.glow.position.set(0, 0.6, 1.2);
    car.add(car.userData.glow);

    var labelMaterial = new THREE.MeshBasicMaterial({
      map: makeLabelTexture(data),
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    var label = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.2), labelMaterial);
    label.position.set(4.55, 0.55, 0);
    car.add(label);
    car.userData.labelMaterial = labelMaterial;
    scene.add(car);
    return car;
  }

  function buildCars() {
    cars = fallbackCars.map(makeCar);
    backgroundSphere.position.z = -((N - 1) * D) / 2;
    floor.position.z = -((N - 1) * D) / 2;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function loadVehicles() {
    buildCars();
  }

  function readScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();
  if (window.ScrollTrigger && window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) { target = self.progress; }
    });
  }

  var mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
  var carFocus = 0;
  window.addEventListener('pointermove', function (event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function clamp01(value) { return Math.min(Math.max(value, 0), 1); }
  function smoothStep(value) { return value * value * (3 - 2 * value); }
  function frame() {
    requestAnimationFrame(frame);
    var delta = Math.min(clock.getDelta(), 0.05);
    var elapsed = clock.elapsedTime;
    prog += (target - prog) * (reduce ? 1 : 0.075);
    smoothX += (mouseX - smoothX) * 0.04;
    smoothY += (mouseY - smoothY) * 0.04;

    var activeIndex = Math.min(Math.floor(prog * N), N - 1);
    var cameraZ = 15 - activeIndex * D;
    carFocus += (activeIndex - carFocus) * (reduce ? 1 : 0.06);
    camera.position.z += (cameraZ - camera.position.z) * (reduce ? 1 : 0.06);
    camera.position.x = smoothX * 0.45;
    camera.position.y = 1.6 - smoothY * 0.18;
    camera.rotation.set(-smoothY * 0.035, -smoothX * 0.08, 0);

    lightRig.position.set(smoothX * 2, 0, cameraZ);
    goldLight.position.set(-4 + Math.sin(elapsed * 0.45) * 2, 4 + Math.sin(elapsed * 0.65) * 0.6, -5);
    blueLight.position.set(4 + Math.cos(elapsed * 0.36) * 2, 2.5 + Math.sin(elapsed * 0.5) * 0.7, -9);
    var coolBlend = prog < 0.5 ? prog * 2 : (1 - prog) * 2;
    var sceneLightColor = new THREE.Color(GOLD).lerp(new THREE.Color(BLUE), clamp01(coolBlend));
    keyLight.color.copy(sceneLightColor);
    goldLight.intensity = 0.8 + (1 - coolBlend) * 1.8;
    blueLight.intensity = 0.7 + coolBlend * 1.6;
    stars.rotation.y = Math.sin(elapsed * 0.035) * 0.035;

    cars.forEach(function (car, index) {
      var near = smoothStep(clamp01(1 - Math.abs(index - carFocus)));
      car.scale.setScalar(0.72 + near * 0.24);
      car.rotation.y = car.userData.baseRotation + Math.sin(elapsed * 0.7) * 0.018;
      car.userData.bodyMaterial.emissiveIntensity = 0.025 + near * 0.24;
      car.userData.glow.color.copy(sceneLightColor);
      car.userData.glow.intensity = near * 1.8;
      car.userData.labelMaterial.opacity = 0.12 + near * 0.88;
    });
    renderer.render(scene, camera);
  }
  var clock = new THREE.Clock();
  frame();
  loadVehicles();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, { passive: true });
})();
