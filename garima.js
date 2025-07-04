// Three.js import from CDN
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Get canvas element and create renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create scene and camera
const scene = new THREE.Scene();
// Add Background Stars
const starsGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starVertices = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starField = new THREE.Points(starsGeometry, starMaterial);
scene.add(starField); //  Add stars to the scene

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 2000
);
camera.position.set(0, 80, 220);
camera.lookAt(0, 0, 0); // Focus on center

// Add lights (ambient + point)
const ambient = new THREE.AmbientLight(0xffffff, 0.5); // soft light
scene.add(ambient); 


// Add Sun in the center
//  Step: Realistic Glowing Sun

// 1. Load Sun texture (image file needed)
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('sun.jpg'); 

// 2. Create sun sphere with texture
const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); 
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// 3. Create outer glow using ShaderMaterial
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    'c': { type: 'f', value: 0.3 },
    'p': { type: 'f', value: 6.0 },
    glowColor: { type: 'c', value: new THREE.Color(0xffa500) },
    viewVector: { type: 'v3', value: camera.position }
  },
  vertexShader: `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vNormView = normalize(viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);
      intensity = pow(c - dot(vNormal, vNormView), p);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    varying float intensity;
    void main() {
      gl_FragColor = vec4(glowColor * intensity, 1.0);
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

// 4. Add glow mesh around the Sun
const glowMesh = new THREE.Mesh(
  new THREE.SphereGeometry(21, 64, 64),
  glowMaterial
);
scene.add(glowMesh);

// 5. Place light at sun's position
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.copy(sun.position);
scene.add(pointLight);


// Export planets array for sliders
export const planets = [];

// All 8 planets with details
const planetData = [
  { name: "Mercury", color: 0xaaaaaa, size: 2.0, distance: 20, speed: 0.03 },
  { name: "Venus",  color: 0xffcc99    , size: 4.0, distance: 30, speed: 0.02 },
  { name: "Earth",   color: 0x3366ff   , size: 4.4, distance: 44, speed: 0.01 },
  { name: "Mars",    color: 0xff3300  , size: 4.0, distance: 60, speed: 0.009 },
  { name: "Jupiter", color: 0xff9966   , size: 7.0, distance: 84, speed: 0.008 },
  { name: "Saturn",   color: 0xfff7b2  , size: 3.4, distance: 110, speed: 0.006 },
  { name: "Uranus",  color: 0x66ffff , size: 2.6, distance: 136, speed: 0.005 },
  { name: "Neptune",  color: 0x9999ff , size: 2.6, distance: 160, speed: 0.004 }
];

// Create each planet as a rotating group
planetData.forEach(p => {
  const group = new THREE.Group(); // For orbit rotation
  const geo = new THREE.SphereGeometry(p.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: p.color });


  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = p.distance; // Move planet away from center
  group.add(mesh);
  scene.add(group); // Add planet to scene

  // Store all data including speedFactor (used by sliders)
  planets.push({ ...p, group, mesh, angle: 0, speedFactor: 1 });
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate); // Loop
  glowMaterial.uniforms.viewVector.value = camera.position;
  const dt = clock.getDelta(); // Time since last frame

  planets.forEach(p => {
    p.angle += p.speed * p.speedFactor;     // Speed controlled by slider
    p.group.rotation.y = p.angle;           // Rotate group (orbit)
  });

  renderer.render(scene, camera); // Draw everything
}

animate(); // Start animation
