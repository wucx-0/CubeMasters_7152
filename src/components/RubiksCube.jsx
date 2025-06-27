import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const RubiksCube = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. Get container dimensions
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 2. Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x222222);
    container.appendChild(renderer.domElement);

    // 3. Create scene
    const scene = new THREE.Scene();

    // 4. Create camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(30, 30, 30);

    // 5. Add controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 6. Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 7. Create Rubik's Cube
    const createCube = () => {
      const group = new THREE.Group();
      const size = 3;
      const gap = 0.1;
      const colors = [
        0xff0000, // Red
        0x00ff00, // Green
        0x0000ff, // Blue
        0xffff00, // Yellow
        0xff8c00, // Orange
        0xffffff, // White
      ];

      // Create 3x3x3 cube
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            // Skip inner pieces
            if (x === 1 && y === 1 && z === 1) continue;

            const piece = createPiece(size, gap, colors, x, y, z);
            piece.position.set(
              (x - 1) * (size + gap),
              (y - 1) * (size + gap),
              (z - 1) * (size + gap),
            );
            group.add(piece);
          }
        }
      }
      return group;
    };

    const createPiece = (size, gap, colors, x, y, z) => {
      const group = new THREE.Group();
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const cube = new THREE.Mesh(geometry, material);
      group.add(cube);

      // Add colored faces
      const faceSize = size * 0.95;
      const faceOffset = size / 2 + 0.01;

      if (z === 2) addFace(colors[1], [0, 0, faceOffset], [0, 0, 0]); // Front (green)
      if (z === 0) addFace(colors[2], [0, 0, -faceOffset], [0, Math.PI, 0]); // Back (blue)
      if (x === 2) addFace(colors[0], [faceOffset, 0, 0], [0, Math.PI / 2, 0]); // Right (red)
      if (x === 0)
        addFace(colors[4], [-faceOffset, 0, 0], [0, -Math.PI / 2, 0]); // Left (orange)
      if (y === 2) addFace(colors[5], [0, faceOffset, 0], [-Math.PI / 2, 0, 0]); // Up (white)
      if (y === 0) addFace(colors[3], [0, -faceOffset, 0], [Math.PI / 2, 0, 0]); // Down (yellow)

      function addFace(color, position, rotation) {
        const geometry = new THREE.PlaneGeometry(faceSize, faceSize);
        const material = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
        });
        const face = new THREE.Mesh(geometry, material);
        face.position.set(...position);
        face.rotation.set(...rotation);
        group.add(face);
      }

      return group;
    };

    const cube = createCube();
    scene.add(cube);

    // 8. Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Handle resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 10. Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="cube-container" />;
};

export default RubiksCube;
