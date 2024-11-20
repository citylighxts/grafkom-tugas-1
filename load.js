import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// Tambahkan OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Menambahkan pergerakan halus
controls.dampingFactor = 0.05;

// GLTFLoader untuk memuat model
const loader = new GLTFLoader();

function loadModel(path, position, color) {
    loader.load(
        path,
        (gltf) => {
            const model = gltf.scene;

            // Terapkan warna pada material
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({ color });
                    child.material.needsUpdate = true;
                }
            });

            model.position.set(...position);
            scene.add(model);
        },
        (xhr) => {
            console.log(`Model ${path}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (error) => {
            console.error(`Error loading ${path}:`, error);
        }
    );
}

// Muat model lampu
loadModel('./models/base.glb', [0, 0, 0], 0x8b4513); // Coklat untuk dasar
loadModel('./models/head.glb', [0, 1, 0], 0xffd700); // Kuning untuk kepala
loadModel('./models/stemAtas.glb', [0, 2, 0], 0x228b22); // Hijau untuk batang atas
loadModel('./models/stemBawah.glb', [0, -1, 0], 0x808080); // Abu-abu untuk batang bawah

// Tambahkan pencahayaan
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update kontrol kamera
    renderer.render(scene, camera);
}

animate();
