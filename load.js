import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
}

setupLighting();

const loader = new GLTFLoader().setPath("./model/");

let base, lowerArm, upperArm, head, table;

loader.load("base1.glb", (gltf) => {
  base = gltf.scene;
  base.position.set(0, -1, 0);
  base.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.3,
        roughness: 0.5,
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  const basePivot = new THREE.Object3D();
  basePivot.add(base);
  scene.add(basePivot);

  loader.load("stemBawah.glb", (gltf) => {
    lowerArm = gltf.scene;
    lowerArm.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x000000,
          metalness: 0.3,
          roughness: 0.5,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const lowerArmPivot = new THREE.Object3D();
    lowerArmPivot.position.set(0, 0.867069, 0.000076);
    lowerArmPivot.add(lowerArm);
    base.add(lowerArmPivot);

    loader.load("stemAtas.glb", (gltf) => {
      upperArm = gltf.scene;
      upperArm.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.3,
            roughness: 0.5,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      const upperArmPivot = new THREE.Object3D();
      upperArmPivot.position.set(0, 2.567069, -3.79814 / 3);
      upperArmPivot.add(upperArm);
      lowerArm.add(upperArmPivot);

      loader.load("head.glb", (gltf) => {
        head = gltf.scene;

        head.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x000000,
              metalness: 0.3,
              roughness: 0.5,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const headPivot = new THREE.Object3D();
        headPivot.position.set(0, 2.59814, 1.6);
        headPivot.add(head);
        upperArm.add(headPivot);

        const spotLight = new THREE.SpotLight(0xffffff, 20, 15, Math.PI / 6, 0.3);
        spotLight.position.set(0, 0, 0.5);
        spotLight.castShadow = true;

        const spotLightTarget = new THREE.Object3D();
        spotLightTarget.position.set(0, -5, 5);
        head.add(spotLightTarget);
        spotLight.target = spotLightTarget;

        head.add(spotLight);

        // table
        loader.load("table.glb", (gltf) => {
          table = gltf.scene;
          table.position.set(0, -0.95, 0);
          table.scale.set(1.5, 1.5, 1.5);
          table.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                metalness: 0.3,
                roughness: 0.5,
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(table);

          // tiles
          loader.load("tiles.glb", (gltf) => {
            const tiles = gltf.scene;
            tiles.position.set(0, -6.55, 0);
            // resize tiles 5x bigger
            tiles.scale.set(5, 5, 5);
            tiles.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            scene.add(tiles);
          });
        });
      });
    });
  });
});

// Objek untuk rotasi tiap bagian
const rotations = {
  base: 0,         // Rotasi base (kiri-kanan)
  lowerArmTilt: 0, // Tilt stem bawah (atas-bawah)
  upperArmTilt: 0, // Tilt stem atas (atas-bawah)
  headRotation: 0, // Rotasi head
};

// Update model berdasarkan slider
function updateModelRotation() {
  if (base) {
    base.rotation.y = THREE.MathUtils.degToRad(rotations.base); // Rotasi base (kiri-kanan)
  }
  if (lowerArm) {
    lowerArm.rotation.x = THREE.MathUtils.degToRad(rotations.lowerArmTilt); // Tilt stem bawah
  }
  if (upperArm) {
    upperArm.rotation.x = THREE.MathUtils.degToRad(rotations.upperArmTilt); // Tilt stem atas
  }
  if (head) {
    head.rotation.y = THREE.MathUtils.degToRad(rotations.headRotation); // Rotasi head
  }
}

// Event listener untuk slider
document.getElementById("baseRotation").addEventListener("input", (e) => {
  rotations.base = parseFloat(e.target.value);
  updateModelRotation();
});

document.getElementById("lowerArmTilt").addEventListener("input", (e) => {
  rotations.lowerArmTilt = parseFloat(e.target.value);
  updateModelRotation();
});

document.getElementById("upperArmTilt").addEventListener("input", (e) => {
  rotations.upperArmTilt = parseFloat(e.target.value);
  updateModelRotation();
});

document.getElementById("headRotation").addEventListener("input", (e) => {
  rotations.headRotation = parseFloat(e.target.value);
  updateModelRotation();
});


// const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({
//   color: 0x333333,
//   // transparent: true,
//   // opacity: 0,
//   side: THREE.DoubleSide
// }));
// floor.rotation.x = -Math.PI / 2;
// // floor.position.y = -1;
// floor.position.y = -6.55;
// floor.receiveShadow = true;
// scene.add(floor);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
