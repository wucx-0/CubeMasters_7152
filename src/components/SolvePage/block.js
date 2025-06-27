// Initialize Three.js components
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(30, 30, 30);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.minDistance = 20;
controls.maxDistance = 100;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(1, 1, 1);
directionalLight1.castShadow = true;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-1, -1, -1);
scene.add(directionalLight2);

// Utility function
const degree = (rad) => rad * (Math.PI / 180);

// Cube class
class RubiksCube {
  constructor(order = 3) {
    this.order = order;
    this.pieceSize = 3;
    this.gap = 0.1;
    this.colors = [
      0xff0000, // Red (Right)
      0x00ff00, // Green (Front)
      0x0000ff, // Blue (Back)
      0xffff00, // Yellow (Down)
      0xff8c00, // Orange (Left)
      0xffffff, // White (Up)
    ];
    this.offset = ((order - 1) * (this.pieceSize + this.gap)) / 2;
    this.blocks = [];
    this.group = new THREE.Group();
    scene.add(this.group);

    this.initialize();
  }

  initialize() {
    // Create the 3D array structure
    for (let x = 0; x < this.order; x++) {
      this.blocks[x] = [];
      for (let y = 0; y < this.order; y++) {
        this.blocks[x][y] = [];
        for (let z = 0; z < this.order; z++) {
          // Skip internal pieces for standard Rubik's cube
          if (
            x > 0 &&
            x < this.order - 1 &&
            y > 0 &&
            y < this.order - 1 &&
            z > 0 &&
            z < this.order - 1
          ) {
            this.blocks[x][y][z] = null;
            continue;
          }

          const piece = this.createPiece(x, y, z);
          this.blocks[x][y][z] = {
            piece: piece,
            x: x,
            y: y,
            z: z,
          };
          this.group.add(piece);
        }
      }
    }
  }

  createPiece(x, y, z) {
    const pieceGroup = new THREE.Group();
    pieceGroup.name = `${x}${y}${z}`;

    // Calculate position with gap
    const posX = x * (this.pieceSize + this.gap) - this.offset;
    const posY = y * (this.pieceSize + this.gap) - this.offset;
    const posZ = z * (this.pieceSize + this.gap) - this.offset;

    // Create the core cube
    const geometry = new THREE.BoxGeometry(
      this.pieceSize,
      this.pieceSize,
      this.pieceSize,
    );
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.7,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    pieceGroup.add(cube);

    // Create colored faces (only on outer surfaces)
    const faceSize = this.pieceSize * 0.95;
    const faceOffset = this.pieceSize / 2 + 0.01;

    // Front face (green)
    if (z === this.order - 1) {
      const frontFace = this.createFace(this.colors[1], faceSize);
      frontFace.position.set(0, 0, faceOffset);
      frontFace.rotation.y = degree(0);
      pieceGroup.add(frontFace);
    }

    // Back face (blue)
    if (z === 0) {
      const backFace = this.createFace(this.colors[2], faceSize);
      backFace.position.set(0, 0, -faceOffset);
      backFace.rotation.y = degree(180);
      pieceGroup.add(backFace);
    }

    // Right face (red)
    if (x === this.order - 1) {
      const rightFace = this.createFace(this.colors[0], faceSize);
      rightFace.position.set(faceOffset, 0, 0);
      rightFace.rotation.y = degree(90);
      pieceGroup.add(rightFace);
    }

    // Left face (orange)
    if (x === 0) {
      const leftFace = this.createFace(this.colors[4], faceSize);
      leftFace.position.set(-faceOffset, 0, 0);
      leftFace.rotation.y = degree(-90);
      pieceGroup.add(leftFace);
    }

    // Up face (white)
    if (y === this.order - 1) {
      const upFace = this.createFace(this.colors[5], faceSize);
      upFace.position.set(0, faceOffset, 0);
      upFace.rotation.x = degree(-90);
      pieceGroup.add(upFace);
    }

    // Down face (yellow)
    if (y === 0) {
      const downFace = this.createFace(this.colors[3], faceSize);
      downFace.position.set(0, -faceOffset, 0);
      downFace.rotation.x = degree(90);
      pieceGroup.add(downFace);
    }

    // Set position
    pieceGroup.position.set(posX, posY, posZ);

    return pieceGroup;
  }

  createFace(color, size) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1,
    });
    const face = new THREE.Mesh(geometry, material);
    face.castShadow = true;
    face.receiveShadow = true;
    return face;
  }

  getPiece(x, y, z) {
    if (
      x < 0 ||
      x >= this.order ||
      y < 0 ||
      y >= this.order ||
      z < 0 ||
      z >= this.order
    ) {
      return null;
    }
    return this.blocks[x][y][z];
  }
}

// Create the cube
const rubiksCube = new RubiksCube(3);

const test_face = new THREE.PlaneGeometry(1, 1);
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
