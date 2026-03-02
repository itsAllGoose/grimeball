import * as THREE from 'three';
import { BALL, COURT, NET, SLIME } from '../game/constants.js';

function createSlimeMesh(radius, colorHex) {
  const geometry = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  geometry.translate(0, -radius, 0);
  const material = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6, metalness: 0.0 });
  return new THREE.Mesh(geometry, material);
}

export function createScene({ mount }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
  mount.appendChild(renderer.domElement);

  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(0, 4.2, 20);
  camera.lookAt(0, 3.6, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(-8, 14, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9ecbff, 0.25);
  fillLight.position.set(10, 9, -6);
  scene.add(fillLight);

  // Court
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(COURT.halfWidth * 2 + 6, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f1a33, roughness: 1.0, metalness: 0.0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = COURT.groundY;
  ground.position.z = -0.6;
  scene.add(ground);

  const groundLine = new THREE.Mesh(
    new THREE.BoxGeometry(COURT.halfWidth * 2 + 2, 0.12, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xe7efff, roughness: 0.3, metalness: 0.0, emissive: 0x111522 })
  );
  groundLine.position.set(0, COURT.groundY - 0.06, 0);
  scene.add(groundLine);

  const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xe7efff, roughness: 0.3, metalness: 0.0, emissive: 0x111522 })
  );
  centerLine.position.set(0, COURT.groundY - 0.06, 0);
  scene.add(centerLine);

  // Net
  const net = new THREE.Mesh(
    new THREE.BoxGeometry(NET.thickness, NET.height, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.0, emissive: 0x101010 })
  );
  net.position.set(NET.x, COURT.groundY + NET.height / 2, 0.1);
  scene.add(net);

  // Entities
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL.radius, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0xfff0a6, roughness: 0.35, metalness: 0.0, emissive: 0x1b1406 })
  );
  ball.position.set(0, COURT.groundY + NET.height + 2, 0.2);
  scene.add(ball);

  const slime1 = createSlimeMesh(SLIME.radius, 0x49d46c);
  slime1.position.set(-5, COURT.groundY + SLIME.radius, 0.2);
  scene.add(slime1);

  const slime2 = createSlimeMesh(SLIME.radius, 0x5aa7ff);
  slime2.position.set(5, COURT.groundY + SLIME.radius, 0.2);
  scene.add(slime2);

  // Simple sky gradient: large quad behind
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 50),
    new THREE.MeshBasicMaterial({ color: 0x0b1220 })
  );
  sky.position.set(0, 18, -5);
  scene.add(sky);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setSize(width, height, false);

    const aspect = width / height;
    const targetHalfWidth = COURT.halfWidth + 2.2;
    const targetHalfHeightMin = 7.8;

    let halfWidth = targetHalfWidth;
    let halfHeight = halfWidth / aspect;
    if (halfHeight < targetHalfHeightMin) {
      halfHeight = targetHalfHeightMin;
      halfWidth = halfHeight * aspect;
    }

    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function setEntityTransforms({ ballPos, slime1Pos, slime2Pos }) {
    ball.position.set(ballPos.x, ballPos.y, 0.2);
    slime1.position.set(slime1Pos.x, slime1Pos.y, 0.2);
    slime2.position.set(slime2Pos.x, slime2Pos.y, 0.2);
  }

  resize();
  window.addEventListener('resize', resize);

  return {
    scene,
    camera,
    renderer,
    resize,
    render,
    setEntityTransforms,
  };
}

