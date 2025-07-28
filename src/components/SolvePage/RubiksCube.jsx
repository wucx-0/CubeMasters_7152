import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './RubiksCube.css';



const RubiksCube = () => {
  const mountRef = useRef(null);
  const cubeRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('Ready');
  const [moveCount, setMoveCount] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [currentMove, setCurrentMove] = useState('-');
  const [moveSequence, setMoveSequence] = useState('-');
  const [errorMessage, setErrorMessage] = useState('');
  const [stepSolveActive, setStepSolveActive] = useState(false);
  const [moveLog, setMoveLog] = useState('');


    // Axis constants as instance properties

  useEffect(() => {
    if (!mountRef.current) return;

    // Get container dimensions
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Initialize Three.js scene
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000); 
    camera.position.set(400, 400, 400);
    const viewCenter = new THREE.Vector3(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(viewCenter);

    // Import OrbitControls dynamically
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.5;
      controls.minDistance = 300; // Increased from 200
      controls.maxDistance = 800; // Increased from 600
      controls.target = viewCenter;
      controlsRef.current = controls;

      // Create cube after controls are ready
      const cube = new RubiksCubeClass(scene, camera, controls, {
        setCurrentStep,
        setMoveCount,
        setStepCount,
        setCurrentMove,
        setMoveSequence,
        setErrorMessage,
        setStepSolveActive,
        setMoveLog 
      });

      cubeRef.current = cube;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // Add renderer to DOM
    container.appendChild(renderer.domElement);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      rendererRef.current.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
// In useEffect cleanup:
    return () => {
        window.removeEventListener('resize', handleResize);
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
        if (controlsRef.current) {
            controlsRef.current.dispose();
        }
        renderer.dispose();
    };
  }, []);

  // Button handlers
  const handleRandomRotate = () => cubeRef.current?.randomRotate();
  const handleScramble = () => cubeRef.current?.scramble();
  const handleAutoSolve = () => cubeRef.current?.autoSolve();
  const handleStop = () => cubeRef.current?.stopSolve();
  const handleNextMove = () => cubeRef.current?.nextMove();
  const handleStepSolve = () => cubeRef.current?.stepSolve();
  const handleReset = () => cubeRef.current?.reset();

  return (
    <div className="rubiks-cube-container">
      {/* 3D Scene */}
      <div ref={mountRef} className="cube-canvas" />
      
      {/* Floating Controls */}
      <div className="cube-controls">
        <div className="control-buttons">
          <button onClick={handleRandomRotate}>Shuffle</button>
          <button onClick={handleStop}>Stop</button>
          <button onClick={handleReset}>Reset</button>
        </div>
        
        <div className="step-control-buttons">
          <button 
            onClick={handleNextMove}
            disabled={!stepSolveActive || currentStep === 'Solved!' || currentStep === 'Ready'}
          >
            &gt;
          </button>
          <button 
            onClick={handleStepSolve}
            disabled={stepSolveActive || currentStep === 'Solved!'}
          >
            &gt;&gt;
          </button>
        </div>
        
        <div className="cube-info">
          <div className="info-row">
            <span>Step: {currentStep}</span>
            <span>Moves: {moveCount}</span>
          </div>
          <div className="current-move">
            Next: {currentMove}
          </div>
          {moveLog && (
            <div className="move-log">
              <strong>Moves:</strong> {moveLog}
            </div>
          )}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

class RubiksCubeClass {
  constructor(scene, camera, controls, uiCallbacks) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.uiCallbacks = uiCallbacks;

    this.moveLog = [];
    this.currentStepMoves = [];
    this.setMoveLog = uiCallbacks.setMoveLog || (() => {});
    
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.num = 3;
    this.len = 50;
    this.isRotating = false;
    this.isAutoSolve = false;
    this.moveCount = 0;
    this.stepCount = 0;
    this.currentStep = 1;
    this.minCubeIndex = 101;
    this.setStepSolveActive = uiCallbacks.setStepSolveActive || (() => {});
    
    // Algorithm specific properties
    this.bottomColor = null;
    this.topColor = null;
    this.startFaceNo = 0;
    this.currentFaceNo = 0;
    this.endFaceNo = 3;
    this.startTime = 0;
    this.endTime = 0;
    this.XLine = new THREE.Vector3(1, 0, 0);
    this.YLine = new THREE.Vector3(0, 1, 0);
    this.ZLine = new THREE.Vector3(0, 0, 1);
    this.XLineAd = new THREE.Vector3(-1, 0, 0);
    this.YLineAd = new THREE.Vector3(0, -1, 0);
    this.ZLineAd = new THREE.Vector3(0, 0, -1);
    
    // Colors matching the original: [Right, Left, Up, Down, Front, Back]
    this.colors = [
      0xff0000, // Red (Right)
      0xff8c00, // Orange (Left)  
      0xffffff, // White (Up)
      0xffff00, // Yellow (Down)
      0x00ff00, // Green (Front)
      0x0000ff  // Blue (Back)
    ];
    
    this.colorNames = ['red', 'orange', 'white', 'yellow', 'green', 'blue'];
    
    this.cubes = [];
    this.initStatus = [];
    this.moveQueue = [];
    
    // For mouse/touch interaction
    this.intersect = null;
    this.normalize = null;
    this.startPoint = null;
    this.movePoint = null;
    
    // Three.js objects
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.initialize();
    this.setupEventListeners();
    this.updateUI();
  }

  initialize() {
    // Clear existing cubes
    this.cubes.forEach(cube => this.scene.remove(cube));
    this.cubes = [];
    this.initStatus = [];
    
    // Calculate starting position
    const leftUpX = this.x - this.num / 2 * this.len;
    const leftUpY = this.y + this.num / 2 * this.len;
    const leftUpZ = this.z + this.num / 2 * this.len;
    
    let cubeIndex = this.minCubeIndex;
    const ids = [];
    
    // Create all cubes
    for (let i = 0; i < this.num; i++) {
      for (let j = 0; j < this.num * this.num; j++) {
        const x = (leftUpX + this.len / 2) + (j % this.num) * this.len;
        const y = (leftUpY - this.len / 2) - Math.floor(j / this.num) * this.len;
        const z = (leftUpZ - this.len / 2) - i * this.len;
        
        const cube = this.createCube(x, y, z);
        cube.cubeIndex = cubeIndex;
        
        this.initStatus.push({
          x: x,
          y: y,
          z: z,
          cubeIndex: cubeIndex
        });
        
        ids.push(cubeIndex);
        this.cubes.push(cube);
        this.scene.add(cube);
        
        cubeIndex++;
      }
    }
    
    this.minCubeIndex = Math.min(...ids);
    
    // Add transparent cube for interaction
    const coverGeometry = new THREE.BoxGeometry(150, 150, 150);
    const coverMaterial = new THREE.MeshNormalMaterial({
      opacity: 0,
      transparent: true
    });
    const coverCube = new THREE.Mesh(coverGeometry, coverMaterial);
    coverCube.cubeType = 'coverCube';
    this.scene.add(coverCube);
  }

  createCube(x, y, z) {
    const materials = [];
    
    // Create materials for each face
    for (let i = 0; i < this.colors.length; i++) {
      const canvas = this.createFaceCanvas(this.colors[i]);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      const material = new THREE.MeshLambertMaterial({ map: texture });
      materials.push(material);
    }
    
    const geometry = new THREE.BoxGeometry(this.len, this.len, this.len);
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(x, y, z);
    
    return cube;
  }

  createFaceCanvas(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Black background
      context.fillStyle = 'rgba(0,0,0,1)';
      context.fillRect(0, 0, 256, 256);
      
      // Colored square with rounded corners
      context.beginPath();
      context.rect(16, 16, 224, 224);
      context.lineJoin = 'round';
      context.lineWidth = 16;
      
      // Convert hex color to rgba string
      const r = (color >> 16) & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = color & 0xFF;
      const rgbaColor = `rgba(${r},${g},${b},1)`;
      
      context.fillStyle = rgbaColor;
      context.strokeStyle = rgbaColor;
      context.stroke();
      context.fill();
    }
    
    return canvas;
  }

  nextMove() {
    if (this.isRotating || !this.isAutoSolve) return;
    
    // Execute current step
    this.executeCurrentStep();
  }

  stepSolve() {
    if (this.isRotating || this.isAutoSolve) return;
    
    this.isAutoSolve = true;
    this.setStepSolveActive(true);
    
    // Get top and bottom colors if not set
    if (!this.topColor) {
      const topCenter = this.getCubeByIndex(10);
      this.topColor = this.getFaceColorByVector(topCenter, this.YLine);
      this.bottomColor = this.getOppositeColor(this.topColor);
    }
    
    this.determineCurrentStep();
    this.executeCurrentStep();
  }

  executeCurrentStep() {
    if (this.isRotating) return;
    
    switch(this.currentStep) {
      case 1: this.step1(); break;
      case 2: this.step2(); break;
      case 3: this.step3(); break;
      case 4: this.step4(); break;
      case 5: this.step5(); break;
      case 6: this.step6(); break;
      case 7: this.step7(); break;
      case 8: this.step8(); break;
    }
  }


  reset() {
    this.isAutoSolve = false;
    this.isRotating = false;
    this.moveCount = 0;
    this.stepCount = 0;
    this.currentStep = 0;
    
    this.clearMoveLog();
    
    this.initialize();
    this.updateUI();
    this.setStepSolveActive(false);
    this.uiCallbacks.setCurrentMove('-');
    this.uiCallbacks.setMoveSequence('-');
    this.uiCallbacks.setErrorMessage('');
  }

  setupEventListeners() {
    // Mouse events - attach to the renderer's DOM element
    const canvas = this.scene.children.find(child => child.parent?.domElement) || 
                   document.querySelector('canvas') || 
                   this.camera.parent?.domElement;
    /*
    // Use document for global events
    document.addEventListener('mousedown', (e) => this.startCube(e), false);
    document.addEventListener('mousemove', (e) => this.moveCube(e), false);
    document.addEventListener('mouseup', () => this.stopCube(), false);
    
    // Touch events
    document.addEventListener('touchstart', (e) => this.startCube(e), false);
    document.addEventListener('touchmove', (e) => this.moveCube(e), false);
    document.addEventListener('touchend', () => this.stopCube(), false);
    */
    
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyboard(e), false);
  }

  handleKeyboard(event) {
    if (this.isRotating || this.isAutoSolve) return;
    
    const key = event.key;
    const upperKey = key.toUpperCase();
    const isUpperCase = key === upperKey;
    
    // Remember: in this notation, uppercase = anticlockwise, lowercase = clockwise
    switch (upperKey) {
      case 'U':
        if (isUpperCase) this.U();
        else this.u();
        break;
      case 'D':
        if (isUpperCase) this.D();
        else this.d();
        break;
      case 'R':
        if (isUpperCase) this.R();
        else this.r();
        break;
      case 'L':
        if (isUpperCase) this.L();
        else this.l();
        break;
      case 'F':
        if (isUpperCase) this.F();
        else this.f();
        break;
      case 'B':
        if (isUpperCase) this.B();
        else this.b();
        break;
    }
  }

  // Get cube by linear index (algorithm integration)
  getCubeByIndex(index, rotateNum = 0) {
    let tempIndex = index;
    
    // Apply rotation transformation to index
    while (rotateNum > 0) {
      if (Math.floor(index / 9) === 0) {
        if (index % 3 === 0) {
          index += 2;
        } else if (index % 3 === 1) {
          index += 10;
        } else if (index % 3 === 2) {
          index += 18;
        }
      } else if (index % 3 === 2) {
        if (Math.floor(index / 9) === 0) {
          index += 18;
        } else if (Math.floor(index / 9) === 1) {
          index += 8;
        } else if (Math.floor(index / 9) === 2) {
          index -= 2;
        }
      } else if (Math.floor(index / 9) === 2) {
        if (index % 3 === 2) {
          index -= 2;
        } else if (index % 3 === 1) {
          index -= 10;
        } else if (index % 3 === 0) {
          index -= 18;
        }
      } else if (index % 3 === 0) {
        if (Math.floor(index / 9) === 2) {
          index -= 18;
        } else if (Math.floor(index / 9) === 1) {
          index -= 8;
        } else if (Math.floor(index / 9) === 0) {
          index += 2;
        }
      }
      rotateNum--;
    }
    
    // Find cube with matching index
    for (let i = 0; i < this.cubes.length; i++) {
      if (this.cubes[i].cubeIndex === index + this.minCubeIndex) {
        return this.cubes[i];
      }
    }
    console.warn(`Could not find cube with index ${index}`);
    return null;
  }

  getCubeByIndexs(indexs) {
    return indexs.map(index => this.getCubeByIndex(index));
  }

  // Get face color by vector
  getFaceColorByVector(cube, vector) {
    if (!cube || !vector) return 0;
    
    // Transform vector to object space
    const localVector = vector.clone();
    const worldToLocal = cube.matrixWorld.clone().invert();
    localVector.transformDirection(worldToLocal);
    
    // Determine which face the vector points to
    const abs = localVector.clone();
    abs.x = Math.abs(abs.x);
    abs.y = Math.abs(abs.y);
    abs.z = Math.abs(abs.z);
    
    let faceIndex;
    if (abs.x > abs.y && abs.x > abs.z) {
      faceIndex = localVector.x > 0 ? 0 : 1; // Right : Left
    } else if (abs.y > abs.z) {
      faceIndex = localVector.y > 0 ? 2 : 3; // Up : Down
    } else {
      faceIndex = localVector.z > 0 ? 4 : 5; // Front : Back
    }
    
    return faceIndex;
  }

  // Rotate axis by Y line
  rotateAxisByYLine(vector, rotateNum) {
    let result = vector.clone();
    while (rotateNum > 0) {
      if (result.angleTo(this.XLine) === 0) {
        result = this.ZLineAd.clone();
      } else if (result.angleTo(this.ZLineAd) === 0) {
        result = this.XLineAd.clone();
      } else if (result.angleTo(this.XLineAd) === 0) {
        result = this.ZLine.clone();
      } else if (result.angleTo(this.ZLine) === 0) {
        result = this.XLine.clone();
      }
      rotateNum--;
    }
    return result;
  }

  // Get opposite color
  getOppositeColor(no) {
    if (no % 2 === 0 || no === 0) {
      return no + 1;
    } else {
      return no - 1;
    }
  }

  updateUI() {
    this.uiCallbacks.setCurrentStep(this.currentStep === 0 ? 'Ready' : `Step ${this.currentStep}`);
    this.uiCallbacks.setMoveCount(this.moveCount);
    this.uiCallbacks.setStepCount(this.stepCount);
  }

  showError(message) {
    this.uiCallbacks.setErrorMessage(message);
    setTimeout(() => {
      this.uiCallbacks.setErrorMessage('');
    }, 3000);
  }

  rotateAroundWorldY(obj, rad) {
    const x0 = obj.position.x;
    const z0 = obj.position.z;
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
    obj.quaternion.premultiply(q);
    obj.position.x = Math.cos(rad) * x0 + Math.sin(rad) * z0;
    obj.position.z = Math.cos(rad) * z0 - Math.sin(rad) * x0;
  }

  rotateAroundWorldZ(obj, rad) {
    const x0 = obj.position.x;
    const y0 = obj.position.y;
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rad);
    obj.quaternion.premultiply(q);
    obj.position.x = Math.cos(rad) * x0 - Math.sin(rad) * y0;
    obj.position.y = Math.cos(rad) * y0 + Math.sin(rad) * x0;
  }

  rotateAroundWorldX(obj, rad) {
    const y0 = obj.position.y;
    const z0 = obj.position.z;
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rad);
    obj.quaternion.premultiply(q);
    obj.position.y = Math.cos(rad) * y0 - Math.sin(rad) * z0;
    obj.position.z = Math.cos(rad) * z0 + Math.sin(rad) * y0;
  }

  // Get elements for rotation based on direction
  getBoxs(target, direction) {
    const targetId = target.cubeIndex - this.minCubeIndex;
    const numI = Math.floor(targetId / 9);
    const numJ = targetId % 9;
    const boxs = [];
    
    switch (direction) {
      // Around Z axis
      case 0.1:
      case 0.2:
      case 1.1:
      case 1.2:
      case 2.3:
      case 2.4:
      case 3.3:
      case 3.4:
        for (let i = 0; i < this.cubes.length; i++) {
          const tempId = this.cubes[i].cubeIndex - this.minCubeIndex;
          if (numI === Math.floor(tempId / 9)) {
            boxs.push(this.cubes[i]);
          }
        }
        break;
      // Around Y axis
      case 0.3:
      case 0.4:
      case 1.3:
      case 1.4:
      case 4.3:
      case 4.4:
      case 5.3:
      case 5.4:
        for (let i = 0; i < this.cubes.length; i++) {
          const tempId = this.cubes[i].cubeIndex - this.minCubeIndex;
          if (Math.floor(numJ / 3) === Math.floor(tempId % 9 / 3)) {
            boxs.push(this.cubes[i]);
          }
        }
        break;
      // Around X axis
      case 2.1:
      case 2.2:
      case 3.1:
      case 3.2:
      case 4.1:
      case 4.2:
      case 5.1:
      case 5.2:
        for (let i = 0; i < this.cubes.length; i++) {
          const tempId = this.cubes[i].cubeIndex - this.minCubeIndex;
          if (tempId % 9 % 3 === numJ % 3) {
            boxs.push(this.cubes[i]);
          }
        }
        break;
    }
    return boxs;
  }

  // Get rotation direction
  getDirection(vector3) {
    let direction;
    
    // Calculate angles with each axis
    const xAngle = vector3.angleTo(this.XLine);
    const xAngleAd = vector3.angleTo(this.XLineAd);
    const yAngle = vector3.angleTo(this.YLine);
    const yAngleAd = vector3.angleTo(this.YLineAd);
    const zAngle = vector3.angleTo(this.ZLine);
    const zAngleAd = vector3.angleTo(this.ZLineAd);
    
    const minAngle = Math.min(xAngle, xAngleAd, yAngle, yAngleAd, zAngle, zAngleAd);
    
    switch (minAngle) {
      case xAngle:
        direction = 0;
        if (this.normalize.equals(this.YLine)) {
          direction += 0.1;
        } else if (this.normalize.equals(this.YLineAd)) {
          direction += 0.2;
        } else if (this.normalize.equals(this.ZLine)) {
          direction += 0.3;
        } else {
          direction += 0.4;
        }
        break;
      case xAngleAd:
        direction = 1;
        if (this.normalize.equals(this.YLine)) {
          direction += 0.1;
        } else if (this.normalize.equals(this.YLineAd)) {
          direction += 0.2;
        } else if (this.normalize.equals(this.ZLine)) {
          direction += 0.3;
        } else {
          direction += 0.4;
        }
        break;
      case yAngle:
        direction = 2;
        if (this.normalize.equals(this.ZLine)) {
          direction += 0.1;
        } else if (this.normalize.equals(this.ZLineAd)) {
          direction += 0.2;
        } else if (this.normalize.equals(this.XLine)) {
          direction += 0.3;
        } else {
          direction += 0.4;
        }
        break;
      case yAngleAd:
        direction = 3;
        if (this.normalize.equals(this.ZLine)) {
          direction += 0.1;
        } else if (this.normalize.equals(this.ZLineAd)) {
          direction += 0.2;
        } else if (this.normalize.equals(this.XLine)) {
          direction += 0.3;
        } else {
          direction += 0.4;
        }
        break;
      case zAngle:
        direction = 4;
        if (this.normalize.equals(this.YLine)) {
          direction += 0.1;
        } else if (this.normalize.equals(this.YLineAd)) {
          direction += 0.2;
        } else if (this.normalize.equals(this.XLine)) {
          direction += 0.3;
        } else {
          direction += 0.4;
        }
        break;
      case zAngleAd:
        direction = 5;
        if (this.normalize.equals(this.YLine)) {
          direction += 0.1;
        } else if (this.normalize.equals(this.YLineAd)) {
          direction += 0.2;
        } else if (this.normalize.equals(this.XLine)) {
          direction += 0.3;
        } else {
          direction += 0.4;
        }
        break;
    }
    return direction;
  }

  // Rotation animation
  rotateAnimation(elements, direction, currentstamp, startstamp, laststamp, next) {
    const totalTime = 200;
    let isLastRotate = false;
    
    if (startstamp === 0) {
      startstamp = currentstamp;
      laststamp = currentstamp;
    }
    
    if (currentstamp - startstamp >= totalTime) {
      currentstamp = startstamp + totalTime;
      isLastRotate = true;
    }
    
    const rotateAngle = 90 * Math.PI / 180 * (currentstamp - laststamp) / totalTime;
    
    switch (direction) {
      // Around Z axis clockwise
      case 0.1:
      case 1.2:
      case 2.4:
      case 3.3:
        elements.forEach(elem => this.rotateAroundWorldZ(elem, -rotateAngle));
        break;
      // Around Z axis counterclockwise
      case 0.2:
      case 1.1:
      case 2.3:
      case 3.4:
        elements.forEach(elem => this.rotateAroundWorldZ(elem, rotateAngle));
        break;
      // Around Y axis clockwise
      case 0.4:
      case 1.3:
      case 4.3:
      case 5.4:
        elements.forEach(elem => this.rotateAroundWorldY(elem, -rotateAngle));
        break;
      // Around Y axis counterclockwise
      case 1.4:
      case 0.3:
      case 4.4:
      case 5.3:
        elements.forEach(elem => this.rotateAroundWorldY(elem, rotateAngle));
        break;
      // Around X axis clockwise
      case 2.2:
      case 3.1:
      case 4.1:
      case 5.2:
        elements.forEach(elem => this.rotateAroundWorldX(elem, rotateAngle));
        break;
      // Around X axis counterclockwise
      case 2.1:
      case 3.2:
      case 4.2:
      case 5.1:
        elements.forEach(elem => this.rotateAroundWorldX(elem, -rotateAngle));
        break;
    }
    
    if (!isLastRotate) {
      requestAnimationFrame((timestamp) => {
        this.rotateAnimation(elements, direction, timestamp, startstamp, currentstamp, next);
      });
    } else {
      this.isRotating = false;
      this.startPoint = null;
      this.updateCubeIndex(elements);
      this.updateUI();
      
      if (next) {
        next();
      } else if (this.isAutoSolve) {
        switch(this.currentStep) {
          case 1: this.step1(); break;
          case 2: this.step2(); break;
          case 3: this.step3(); break;
          case 4: this.step4(); break;
          case 5: this.step5(); break;
          case 6: this.step6(); break;
          case 7: this.step7(); break;
          case 8: this.step8(); break;
          default: break;
        }
      }
    }
  }

    // Update cube positions after rotation
updateCubeIndex(elements) {
    elements.forEach(element => {
        let minDistance = Infinity;
        let closestIndex = null;
        
        this.initStatus.forEach(status => {
        const distance = element.position.distanceTo(
            new THREE.Vector3(status.x, status.y, status.z)
        );
        if (distance < minDistance && distance < this.len / 2) {
            minDistance = distance;
            closestIndex = status.cubeIndex;
        }
        });
        
        if (closestIndex !== null) {
        element.cubeIndex = closestIndex;
        element.skipNext = false;
        } else {
        console.warn('Could not find matching index for cube at position:', element.position);
        } 
    });
    }

    // Rotate move
    rotateMove(target, vector, next) {
    this.isRotating = true;
    const direction = this.getDirection(vector);
    const elements = this.getBoxs(target, direction);
    
    requestAnimationFrame((timestamp) => {
        this.rotateAnimation(elements, direction, timestamp, 0, null, next);
    });
    }

    // Get intersections for mouse/touch events
  getIntersects(event) {
    const rect = this.scene.userData?.canvas?.getBoundingClientRect() || 
                 this.camera.userData?.canvas?.getBoundingClientRect() ||
                 { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    
    if (event.touches) {
      const touch = event.touches[0];
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    } else {
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    
    if (intersects.length) {
        try {
        if (intersects[0].object.cubeType === 'coverCube') {
            this.intersect = intersects[1];
            this.normalize = intersects[0].face.normal;
        } else {
            this.intersect = intersects[0];
            this.normalize = intersects[1].face.normal;
        }
        } catch (err) {
        // Handle error silently
        }
    }
    }

    // Mouse/touch event handlers
    startCube(event) {
    this.getIntersects(event);
    
    if (!this.isRotating && this.intersect) {
        this.startPoint = this.intersect.point;
        this.controls.enabled = false;
    } else {
        this.controls.enabled = true;
    }
    }

    moveCube(event) {
    this.getIntersects(event);
    
    if (this.intersect) {
        if (!this.isRotating && this.startPoint) {
        this.movePoint = this.intersect.point;
        if (!this.movePoint.equals(this.startPoint)) {
            const sub = this.movePoint.sub(this.startPoint);
            this.rotateMove(this.intersect.object, sub);
        }
        }
    }
    event.preventDefault();
    }

    stopCube() {
    this.intersect = null;
    this.startPoint = null;
    this.controls.enabled = true;
    }

    // Basic rotation methods (U, D, R, L, F, B and their inverses)
    // Remember: Uppercase = anticlockwise, lowercase = clockwise
    R(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('R');
      const cube2 = this.getCubeByIndex(2, rotateNum);
      const zLineAd = this.rotateAxisByYLine(this.ZLineAd, rotateNum);
      this.normalize = this.YLine;
      this.rotateMove(cube2, zLineAd, next);
      this.updateUI();
    }

    r(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('r');
      const cube2 = this.getCubeByIndex(2, rotateNum);
      const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
      this.normalize = zLine;
      this.rotateMove(cube2, this.YLineAd, next);
      this.updateUI();
    }

    L(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('L');
      const cube0 = this.getCubeByIndex(0, rotateNum);
      const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
      this.normalize = zLine;
      this.rotateMove(cube0, this.YLineAd, next);
      this.updateUI();
    }

    l(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('l');
      const cube0 = this.getCubeByIndex(0, rotateNum);
      const zLineAd = this.rotateAxisByYLine(this.ZLineAd, rotateNum);
      this.normalize = this.YLine;
      this.rotateMove(cube0, zLineAd, next);
      this.updateUI();
    }

    U(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('U');
      const cube2 = this.getCubeByIndex(2, rotateNum);
      const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
      const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
      this.normalize = zLine;
      this.rotateMove(cube2, xLineAd, next);
      this.updateUI();
    }

    u(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('u');
      const cube2 = this.getCubeByIndex(2, rotateNum);
      const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
      const zLineAd = this.rotateAxisByYLine(this.ZLineAd, rotateNum);
      this.normalize = xLine;
      this.rotateMove(cube2, zLineAd, next);
      this.updateUI();
    }

    D(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('D');
      const cube8 = this.getCubeByIndex(8, rotateNum);
      const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
      const zLineAd = this.rotateAxisByYLine(this.ZLineAd, rotateNum);
      this.normalize = xLine;
      this.rotateMove(cube8, zLineAd, next);
      this.updateUI();
    }

    d(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('d');
      const cube8 = this.getCubeByIndex(8, rotateNum);
      const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
      const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
      this.normalize = zLine;
      this.rotateMove(cube8, xLineAd, next);
      this.updateUI();
    }

    F(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('F');
      const cube2 = this.getCubeByIndex(2, rotateNum);
      const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
      this.normalize = xLine;
      this.rotateMove(cube2, this.YLineAd, next);
      this.updateUI();
    }

    f(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('f');
      const cube2 = this.getCubeByIndex(2, rotateNum);
      const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
      this.normalize = this.YLine;
      this.rotateMove(cube2, xLineAd, next);
      this.updateUI();
    }

    B(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('B');
      const cube20 = this.getCubeByIndex(20, rotateNum);
      const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
      this.normalize = xLine;
      this.rotateMove(cube20, this.YLine, next);
      this.updateUI();
    }

    b(rotateNum = 0, next = null) {
      this.stepCount++;
      this.moveCount++;
      this.logMove('b');
      const cube20 = this.getCubeByIndex(20, rotateNum);
      const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
      this.normalize = xLine;
      this.rotateMove(cube20, this.YLineAd, next);
      this.updateUI();
    }

    // Execute a sequence of moves
    runMethodAtNo(arr, no, rotateNum, next) {
    if (no >= arr.length - 1) {
        if (next) {
        arr[no].call(this, rotateNum, next);
        } else {
        arr[no].call(this, rotateNum);
        }
    } else {
        arr[no].call(this, rotateNum, () => {
        if (no < arr.length - 1) {
            no++;
            this.runMethodAtNo(arr, no, rotateNum, next);
        }
        });
    }
    }
    logMove(move) {
      this.moveLog.push(move);
      this.currentStepMoves.push(move);
      this.updateMoveLog();
    }

    updateMoveLog() {
      const logString = this.moveLog.join(' ');
      this.setMoveLog(logString);
    }

    clearMoveLog() {
      this.moveLog = [];
      this.currentStepMoves = [];
      this.updateMoveLog();
    }

    // Random shuffle
    randomRotate() {
    if (!this.isRotating && !this.isAutoSolve) {
        const stepNum = Math.floor(Math.random() * 20) + 1;
        console.log('Random rotate ' + stepNum + ' steps');
        
        const funcArr = [
        this.R, this.U, this.F, this.B, this.L, this.D,
        this.r, this.u, this.f, this.b, this.l, this.d
        ];
        
        const stepArr = [];
        for (let i = 0; i < stepNum; i++) {
        const num = Math.floor(Math.random() * funcArr.length);
        stepArr.push(funcArr[num]);
        }
        
        this.moveCount = 0;
        this.updateUI();
        this.runMethodAtNo(stepArr, 0, 0 ,() => {
        this.updateUI();
        });
    }
    }

    // Predetermined scramble
    scramble() {
      if (this.isRotating || this.isAutoSolve) return;
      
      const scrambleSequence = [
        'R', 'U', 'R', 'U', 'R', 'u', 'r', 'u', 'r',
        'F', 'R', 'u', 'r', 'f', 'R', 'U', 'R', 'u',
        'L', 'u', 'L', 'U', 'l', 'U', 'l', 'D', 'R',
        'u', 'r', 'd'
      ];
      
      this.currentStep = 0;
      this.moveCount = 0;
      this.clearMoveLog(); // Clear previous log
      this.updateUI();
      
      this.uiCallbacks.setCurrentStep('Scrambling...');
      this.uiCallbacks.setMoveSequence(scrambleSequence.join(' '));
      
      const moves = scrambleSequence.map(move => {
        switch(move) {
          case 'R': return this.R;
          case 'r': return this.r;
          case 'U': return this.U;
          case 'u': return this.u;
          case 'L': return this.L;
          case 'l': return this.l;
          case 'D': return this.D;
          case 'd': return this.d;
          case 'F': return this.F;
          case 'f': return this.f;
          case 'B': return this.B;
          case 'b': return this.b;
        }
      });
      
      this.runMethodAtNo(moves, 0, 0, () => {
          this.uiCallbacks.setCurrentStep('Scrambled - Ready to Solve');
          this.uiCallbacks.setCurrentMove('-');
          this.updateUI();
      });
    }

    // Stop solving
    stopSolve() {
      this.isAutoSolve = false;
      this.setStepSolveActive(false);
      this.currentStep = 0;
      this.uiCallbacks.setCurrentStep('Stopped');
      this.uiCallbacks.setCurrentMove('-');
      this.uiCallbacks.setMoveSequence('Solving stopped');
      this.updateUI();
    }

    // Auto solve main method
    autoSolve() {
      if (!this.checkStep8() && !this.isRotating) {
        console.log('Auto solve mode activated - use > button to proceed step by step');
        this.startTime = performance.now();
        this.stepCount = 0;
        this.moveCount = 0;
        this.isAutoSolve = true;
        this.setStepSolveActive(true);
        
        // Get top and bottom colors
        const topCenter = this.getCubeByIndex(10);
        this.topColor = this.getFaceColorByVector(topCenter, this.YLine);
        this.bottomColor = this.getOppositeColor(this.topColor);
        
        // Determine current step
        this.determineCurrentStep();
        this.updateUI();
      } else {
        console.log('Already solved');
      }
    }
    determineCurrentStep() {
      if (this.checkStep7()) {
        this.currentStep = 8;
        this.uiCallbacks.setCurrentStep('Step 8: Final Orient Corners');
      } else if (this.checkStep6()) {
        this.currentStep = 7;
        this.uiCallbacks.setCurrentStep('Step 7: Orient Top Edges');
      } else if (this.checkStep5()) {
        this.currentStep = 6;
        this.uiCallbacks.setCurrentStep('Step 6: Position Top Corners');
      } else if (this.checkStep4()) {
        this.currentStep = 5;
        this.uiCallbacks.setCurrentStep('Step 5: Top Cross');
      } else if (this.checkStep3()) {
        this.currentStep = 4;
        this.uiCallbacks.setCurrentStep('Step 4: Middle Layer');
      } else if (this.checkStep2()) {
        this.currentStep = 3;
        this.uiCallbacks.setCurrentStep('Step 3: Bottom Corners');
      } else if (this.checkStep1()) {
        this.currentStep = 2;
        this.uiCallbacks.setCurrentStep('Step 2: Bottom Edges');
      } else {
        this.currentStep = 1;
        this.uiCallbacks.setCurrentStep('Step 1: White Cross');
      }
    }

    // Step 1: White Cross
    step1() {
      if (this.checkStep1()) {
        console.log('Step 1 complete');
        this.currentStep = 2;
        this.uiCallbacks.setCurrentStep('Step 2: Bottom Edges');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 1: White Cross');
      this.uiCallbacks.setCurrentMove('Finding white edges...');
      
      this.step1Case1(0);
      this.step1Case1(1);
      this.step1Case1(2);
      this.step1Case1(3);
      
      this.step1Case2(0);
      this.step1Case2(1);
      this.step1Case2(2);
      this.step1Case2(3);
      
      this.step1Case3(0);
      this.step1Case3(1);
      this.step1Case3(2);
      this.step1Case3(3);
      
      this.step1Case4(0);
      this.step1Case4(1);
      this.step1Case4(2);
      this.step1Case4(3);
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 1');
        this.showError('Error in Step 1');
      }
    }

    checkStep1() {
    const indexs = [1, 9, 11, 19];
    for (let i = 0; i < indexs.length; i++) {
        const item = this.getCubeByIndex(indexs[i]);
        const color = this.getFaceColorByVector(item, this.YLine);
        if (color !== this.bottomColor) {
        return false;
        }
    }
    return true;
    }

    step1Case1(rotateNum) {
    if (!this.isRotating) {
        const cube3 = this.getCubeByIndex(3, rotateNum);
        const cube9 = this.getCubeByIndex(9, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
        
        if (this.getFaceColorByVector(cube3, zLine) === this.bottomColor) {
        if (this.getFaceColorByVector(cube9, this.YLine) !== this.bottomColor) {
            this.l(rotateNum);
        } else {
            this.u(rotateNum);
        }
        }
    }
    }

    step1Case2(rotateNum) {
    if (!this.isRotating) {
        const cube5 = this.getCubeByIndex(5, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube5, zLine) === this.bottomColor) {
        if (this.getFaceColorByVector(cube11, this.YLine) !== this.bottomColor) {
            this.R(rotateNum);
        } else {
            this.u(rotateNum);
        }
        }
    }
    }

    step1Case3(rotateNum) {
    if (!this.isRotating) {
        const cube15 = this.getCubeByIndex(15, rotateNum);
        const cube9 = this.getCubeByIndex(9, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
        
        if (this.getFaceColorByVector(cube15, this.YLineAd) === this.bottomColor) {
        if (this.getFaceColorByVector(cube9, this.YLine) !== this.bottomColor) {
            this.l(rotateNum);
        } else {
            this.u(rotateNum);
        }
        }
    }
    }

    step1Case4(rotateNum) {
    if (!this.isRotating) {
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube1, zLine) === this.bottomColor || 
            this.getFaceColorByVector(cube7, zLine) === this.bottomColor) {
        if (this.getFaceColorByVector(cube1, this.YLine) !== this.bottomColor) {
            this.F(rotateNum);
        } else {
            this.D(rotateNum);
        }
        }
    }
    }

    // Step 2: Bottom Edges 
    step2() {
      if (this.checkStep2()) {
        console.log('Step 2 complete');
        this.currentStep = 3;
        this.uiCallbacks.setCurrentStep('Step 3: Bottom Corners');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 2: Bottom Edges');
      
      this.step2Case1(0);
      this.step2Case1(1);
      this.step2Case1(2);
      this.step2Case1(3);
      
      this.step2Case2(0);
      this.step2Case2(1);
      this.step2Case2(2);
      this.step2Case2(3);
      
      this.step2Case3(0);
      this.step2Case3(1);
      this.step2Case3(2);
      this.step2Case3(3);
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 2');
        this.showError('Error in Step 2');
      }
    }

    checkStep2() {
    const indexs = [4, 7, 14, 17, 22, 25, 12, 15];
    const lines = [this.ZLine, this.XLine, this.ZLineAd, this.XLineAd];
    const arr = this.getCubeByIndexs(indexs);
    
    for (let i = 0; i < arr.length; i++) {
        const no = Math.floor(i / 2);
        const color1 = this.getFaceColorByVector(arr[i], lines[no]);
        
        if (color1 === this.topColor || color1 === this.bottomColor) {
        return false;
        }
        
        if (i % 2 === 0) {
        const color2 = this.getFaceColorByVector(arr[i + 1], lines[no]);
        if (color1 !== color2) {
            return false;
        }
        }
    }
    
    // Check bottom cross
    const bottomEdges = [7, 15, 17, 25];
    for (let i = 0; i < bottomEdges.length; i++) {
        const cube = this.getCubeByIndex(bottomEdges[i]);
        const color = this.getFaceColorByVector(cube, this.YLineAd);
        if (color !== this.bottomColor) {
        return false;
        }
    }
    
    // Check corners don't have bottom color on bottom
    const corners = [6, 8, 26, 24];
    for (let i = 0; i < corners.length; i++) {
        const cube = this.getCubeByIndex(corners[i]);
        const color = this.getFaceColorByVector(cube, this.YLineAd);
        if (color === this.bottomColor) {
        return false;
        }
    }
    
    return true;
    }

    step2Case1(rotateNum) {
    if (!this.isRotating) {
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        
        if (this.getFaceColorByVector(cube1, this.YLine) === this.bottomColor) {
        if (this.getFaceColorByVector(cube1, zLine) === this.getFaceColorByVector(cube4, zLine)) {
            this.F(rotateNum, () => {
            this.F(rotateNum);
            });
        } else {
            this.u(rotateNum, () => {
            const newRotateNum = (rotateNum + 1) % 4;
            this.step2Case1(newRotateNum);
            });
        }
        }
    }
    }

    step2Case2(rotateNum) {
    if (!this.isRotating) {
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const cube8 = this.getCubeByIndex(8, rotateNum);
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube7, this.YLineAd) === this.bottomColor &&
            this.getFaceColorByVector(cube8, this.YLineAd) === this.bottomColor) {
        if (this.getFaceColorByVector(cube2, xLine) !== this.bottomColor) {
            this.R(rotateNum, () => {
            this.u(rotateNum, () => {
                this.r(rotateNum);
            });
            });
        } else {
            this.f(rotateNum, () => {
            this.u(rotateNum, () => {
                this.F(rotateNum);
            });
            });
        }
        }
    }
    }

    step2Case3(rotateNum) {
    if (!this.isRotating) {
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const cube6 = this.getCubeByIndex(6, rotateNum);
        const cube0 = this.getCubeByIndex(0, rotateNum);
        const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
        
        if (this.getFaceColorByVector(cube7, this.YLineAd) === this.bottomColor &&
            this.getFaceColorByVector(cube6, this.YLineAd) === this.bottomColor) {
        if (this.getFaceColorByVector(cube0, xLineAd) !== this.bottomColor) {
            this.l(rotateNum, () => {
            this.u(rotateNum, () => {
                this.L(rotateNum);
            });
            });
        } else {
            this.f(rotateNum, () => {
            this.u(rotateNum, () => {
                this.F(rotateNum);
            });
            });
        }
        }
    }
    }

    // Step 3: Bottom Corners
    step3() {
      if (this.checkStep3()) {
        console.log('Step 3 complete');
        this.currentStep = 4;
        this.startFaceNo = 0;
        this.endFaceNo = 3;
        this.uiCallbacks.setCurrentStep('Step 4: Middle Layer');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 3: Bottom Corners');
      
      // Try all cases for all rotations
      for (let i = 0; i < 4; i++) {
        this.step3Case1(i);
        this.step3Case2(i);
        this.step3Case3(i);
        this.step3Case4(i);
        this.step3Case5(i);
      }
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 3');
        this.showError('Error in Step 3');
      }
    }

    checkStep3() {
    const checkStep3Item = (indexs, line) => {
        if (indexs.length > 0) {
        const arr = this.getCubeByIndexs(indexs);
        for (let i = 1; i < arr.length; i++) {
            if (this.getFaceColorByVector(arr[i], line) !== this.getFaceColorByVector(arr[0], line)) {
            return false;
            }
            if (this.getFaceColorByVector(arr[i], this.YLineAd) !== this.bottomColor) {
            return false;
            }
        }
        }
        return true;
    };
    
    let result = true;
    
    const indexs1 = [4, 6, 7, 8];
    result = checkStep3Item(indexs1, this.ZLine);
    if (!result) return result;
    
    const indexs2 = [14, 8, 17, 26];
    result = checkStep3Item(indexs2, this.XLine);
    if (!result) return result;
    
    const indexs3 = [22, 24, 25, 26];
    result = checkStep3Item(indexs3, this.ZLineAd);
    if (!result) return result;
    
    const indexs4 = [12, 6, 15, 24];
    result = checkStep3Item(indexs4, this.XLineAd);
    
    return result;
    }

    step3Case1(rotateNum, startNum) {
    if (!this.isRotating) {
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const cube17 = this.getCubeByIndex(17, rotateNum);
        const cube8 = this.getCubeByIndex(8, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const zLine2Color = this.getFaceColorByVector(cube2, zLine);
        const yLine2Color = this.getFaceColorByVector(cube2, this.YLine);
        
        if (this.getFaceColorByVector(cube2, xLine) === this.bottomColor && !cube2.skipNext) {
        if (this.getFaceColorByVector(cube8, this.YLineAd) !== this.bottomColor &&
            this.getFaceColorByVector(cube4, zLine) === zLine2Color &&
            this.getFaceColorByVector(cube7, zLine) === zLine2Color &&
            this.getFaceColorByVector(cube14, xLine) === yLine2Color &&
            this.getFaceColorByVector(cube17, xLine) === yLine2Color) {
            this.R(rotateNum, () => {
            this.U(rotateNum, () => {
                this.r(rotateNum);
            });
            });
        } else {
            this.u(rotateNum, () => {
            const newRotateNum = (rotateNum + 1) % 4;
            if (startNum !== newRotateNum) {
                if (startNum == null || startNum === undefined) {
                startNum = rotateNum;
                this.step3Case1(newRotateNum, startNum);
                } else {
                this.step3Case1(newRotateNum, startNum);
                }
            } else {
                const cube2 = this.getCubeByIndex(2, newRotateNum);
                cube2.skipNext = true;
                this.step3();
            }
            });
        }
        }
    }
    }

    step3Case2(rotateNum, startNum) {
    if (!this.isRotating) {
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const cube17 = this.getCubeByIndex(17, rotateNum);
        const cube8 = this.getCubeByIndex(8, rotateNum);
        const yLine2Color = this.getFaceColorByVector(cube2, this.YLine);
        const xLine2Color = this.getFaceColorByVector(cube2, xLine);
        
        if (this.getFaceColorByVector(cube2, zLine) === this.bottomColor && !cube2.skipNext) {
        if (this.getFaceColorByVector(cube8, this.YLineAd) !== this.bottomColor &&
            this.getFaceColorByVector(cube4, zLine) === yLine2Color &&
            this.getFaceColorByVector(cube7, zLine) === yLine2Color &&
            this.getFaceColorByVector(cube14, xLine) === xLine2Color &&
            this.getFaceColorByVector(cube17, xLine) === xLine2Color) {
            this.f(rotateNum, () => {
            this.u(rotateNum, () => {
                this.F(rotateNum);
            });
            });
        } else {
            this.u(rotateNum, () => {
            const newRotateNum = (rotateNum + 1) % 4;
            if (startNum !== newRotateNum) {
                if (startNum == null || startNum === undefined) {
                startNum = rotateNum;
                this.step3Case2(newRotateNum, startNum);
                } else {
                this.step3Case2(newRotateNum, startNum);
                }
            } else {
                const cube2 = this.getCubeByIndex(2, newRotateNum);
                cube2.skipNext = true;
                this.step3();
            }
            });
        }
        }
    }
    }

    step3Case3(rotateNum, startNum) {
    if (!this.isRotating) {
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const cube8 = this.getCubeByIndex(8, rotateNum);
        const cube17 = this.getCubeByIndex(17, rotateNum);
        const zLine2Color = this.getFaceColorByVector(cube2, zLine);
        const xLine2Color = this.getFaceColorByVector(cube2, xLine);
        
        if (this.getFaceColorByVector(cube2, this.YLine) === this.bottomColor && !cube2.skipNext) {
        if (this.getFaceColorByVector(cube8, this.YLineAd) !== this.bottomColor &&
            this.getFaceColorByVector(cube14, xLine) === zLine2Color &&
            this.getFaceColorByVector(cube17, xLine) === zLine2Color &&
            this.getFaceColorByVector(cube4, zLine) === xLine2Color &&
            this.getFaceColorByVector(cube7, zLine) === xLine2Color) {
            // Convert to case 2
            this.f(rotateNum, () => {
            this.u(rotateNum, () => {
                this.u(rotateNum, () => {
                this.F(rotateNum, () => {
                    this.U(rotateNum);
                });
                });
            });
            });
        } else {
            this.u(rotateNum, () => {
            const newRotateNum = (rotateNum + 1) % 4;
            if (startNum !== newRotateNum) {
                if (startNum == null || startNum === undefined) {
                startNum = rotateNum;
                this.step3Case3(newRotateNum, startNum);
                } else {
                this.step3Case3(newRotateNum, startNum);
                }
            } else {
                const cube2 = this.getCubeByIndex(2, newRotateNum);
                cube2.skipNext = true;
                this.step3();
            }
            });
        }
        }
    }
    }

    step3Case4(rotateNum) {
    if (!this.isRotating) {
        const cube8 = this.getCubeByIndex(8, rotateNum);
        const cube17 = this.getCubeByIndex(17, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const zLine8Color = this.getFaceColorByVector(cube8, zLine);
        const yLineAd8Color = this.getFaceColorByVector(cube8, this.YLineAd);
        
        if (this.getFaceColorByVector(cube8, xLine) === this.bottomColor) {
        if (this.getFaceColorByVector(cube17, xLine) === zLine8Color &&
            this.getFaceColorByVector(cube14, xLine) === zLine8Color &&
            this.getFaceColorByVector(cube4, zLine) === yLineAd8Color &&
            this.getFaceColorByVector(cube7, zLine) === yLineAd8Color) {
            // Convert to case 1
            this.f(rotateNum, () => {
            this.U(rotateNum, () => {
                this.F(rotateNum);
            });
            });
        } else {
            // Convert to case 3
            this.f(rotateNum, () => {
            this.u(rotateNum, () => {
                this.F(rotateNum);
            });
            });
        }
        }
    }
    }

    step3Case5(rotateNum) {
    if (!this.isRotating) {
        const cube8 = this.getCubeByIndex(8, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube7 = this.getCubeByIndex(7, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const cube17 = this.getCubeByIndex(17, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine8Color = this.getFaceColorByVector(cube8, xLine);
        const yLineAd8Color = this.getFaceColorByVector(cube8, this.YLineAd);
        
        if (this.getFaceColorByVector(cube8, zLine) === this.bottomColor) {
        if (this.getFaceColorByVector(cube7, zLine) === xLine8Color &&
            this.getFaceColorByVector(cube4, zLine) === xLine8Color &&
            this.getFaceColorByVector(cube14, xLine) === yLineAd8Color &&
            this.getFaceColorByVector(cube17, xLine) === yLineAd8Color) {
            // Convert to case 2
            this.f(rotateNum, () => {
            this.u(rotateNum, () => {
                this.F(rotateNum, () => {
                this.U(rotateNum);
                });
            });
            });
        } else {
            // Convert to case 3
            this.R(rotateNum, () => {
            this.u(rotateNum, () => {
                this.r(rotateNum);
            });
            });
        }
        }
    }
    }

    // Step 4: Middle Layer
    step4() {
      if (this.checkStep4()) {
        console.log('Step 4 complete');
        this.currentStep = 5;
        this.uiCallbacks.setCurrentStep('Step 5: Top Cross');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 4: Middle Layer');
      this.step4Face(this.currentFaceNo);
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 4');
        this.showError('Error in Step 4');
      }
    }

    checkStep4() {
    if (!this.checkStep3()) {
        return false;
    }
    
    const cube3 = this.getCubeByIndex(3);
    const cube4 = this.getCubeByIndex(4);
    const cube5 = this.getCubeByIndex(5);
    const zLine3Color = this.getFaceColorByVector(cube3, this.ZLine);
    if (this.getFaceColorByVector(cube4, this.ZLine) !== zLine3Color ||
        this.getFaceColorByVector(cube5, this.ZLine) !== zLine3Color) {
        return false;
    }
    
    const cube14 = this.getCubeByIndex(14);
    const cube23 = this.getCubeByIndex(23);
    const xLine5Color = this.getFaceColorByVector(cube5, this.XLine);
    if (this.getFaceColorByVector(cube14, this.XLine) !== xLine5Color ||
        this.getFaceColorByVector(cube23, this.XLine) !== xLine5Color) {
        return false;
    }
    
    const cube21 = this.getCubeByIndex(21);
    const cube22 = this.getCubeByIndex(22);
    const zLineAd23Color = this.getFaceColorByVector(cube23, this.ZLineAd);
    if (this.getFaceColorByVector(cube21, this.ZLineAd) !== zLineAd23Color ||
        this.getFaceColorByVector(cube22, this.ZLineAd) !== zLineAd23Color) {
        return false;
    }
    
    const cube12 = this.getCubeByIndex(12);
    const xLineAd3Color = this.getFaceColorByVector(cube3, this.XLineAd);
    if (this.getFaceColorByVector(cube12, this.XLineAd) !== xLineAd3Color ||
        this.getFaceColorByVector(cube21, this.XLineAd) !== xLineAd3Color) {
        return false;
    }
    
    return true;
    }

    // Helper methods for Step 4 algorithms
    rotate401(rotateNum, next) {
    if (rotateNum < 0) {
        rotateNum = 4 - Math.abs(rotateNum);
    }
    // rururURUR
    const arr = [this.r, this.u, this.r, this.u, this.r, this.U, this.R, this.U, this.R];
    this.runMethodAtNo(arr, 0, rotateNum, next);
    }

    rotate401Opposite(rotateNum, next) {
    if (rotateNum < 0) {
        rotateNum = 4 - Math.abs(rotateNum);
    }
    // ruruRURUR
    const arr = [this.r, this.u, this.r, this.u, this.R, this.U, this.R, this.U, this.R];
    this.runMethodAtNo(arr, 0, rotateNum, next);
    }

    rotate402(rotateNum, next) {
    if (rotateNum < 0) {
        rotateNum = 4 - Math.abs(rotateNum);
    }
    // FUFUFufuf
    const arr = [this.F, this.U, this.F, this.U, this.F, this.u, this.f, this.u, this.f];
    this.runMethodAtNo(arr, 0, rotateNum, next);
    }

    rotate402Opposite(rotateNum, next) {
    if (rotateNum < 0) {
        rotateNum = 4 - Math.abs(rotateNum);
    }
    // FUFUfufuf
    const arr = [this.F, this.U, this.F, this.U, this.f, this.u, this.f, this.u, this.f];
    this.runMethodAtNo(arr, 0, rotateNum, next);
    }

    step4Face(rotateNum) {
    if (!this.isRotating) {
        if (rotateNum > 3) {
        rotateNum = rotateNum - 4;
        }
        this.currentFaceNo = rotateNum;
        
        const cube3 = this.getCubeByIndex(3, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube5 = this.getCubeByIndex(5, rotateNum);
        const cube6 = this.getCubeByIndex(6, rotateNum);
        const cube9 = this.getCubeByIndex(9, rotateNum);
        const cube19 = this.getCubeByIndex(19, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube21 = this.getCubeByIndex(21, rotateNum);
        const cube23 = this.getCubeByIndex(23, rotateNum);
        
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLineAd = this.rotateAxisByYLine(this.XLineAd, rotateNum);
        const zLineAd = this.rotateAxisByYLine(this.ZLineAd, rotateNum);
        
        const zLine4Color = this.getFaceColorByVector(cube4, zLine);
        const xLineAd6Color = this.getFaceColorByVector(cube6, xLineAd);
        const xLine14Color = this.getFaceColorByVector(cube14, xLine);
        
        // Check left edge
        if (this.getFaceColorByVector(cube3, zLine) !== zLine4Color) {
        if (this.getFaceColorByVector(cube9, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube9, xLineAd) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            this.rotate402(rotateNum - 1);
            return;
        } else if (this.getFaceColorByVector(cube9, xLineAd) === zLine4Color &&
            (this.getFaceColorByVector(cube9, this.YLine) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            this.u(0, () => {
            this.rotate401(rotateNum - 1);
            });
            return;
        } else if ((this.getFaceColorByVector(cube19, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube19, zLineAd) === xLineAd6Color || rotateNum === this.startFaceNo)) ||
            (this.getFaceColorByVector(cube19, zLineAd) === zLine4Color &&
            (this.getFaceColorByVector(cube19, this.YLine) === xLineAd6Color || rotateNum === this.startFaceNo)) ||
            (this.getFaceColorByVector(cube11, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube11, xLine) === xLineAd6Color || rotateNum === this.startFaceNo)) ||
            (this.getFaceColorByVector(cube11, xLine) === zLine4Color &&
            (this.getFaceColorByVector(cube11, this.YLine) === xLineAd6Color || rotateNum === this.startFaceNo)) ||
            (this.getFaceColorByVector(cube1, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube1, zLine) === xLineAd6Color || rotateNum === this.startFaceNo)) ||
            (this.getFaceColorByVector(cube1, zLine) === zLine4Color &&
            (this.getFaceColorByVector(cube1, this.YLine) === xLineAd6Color || rotateNum === this.startFaceNo))) {
            this.U(0);
            return;
        } else if (this.getFaceColorByVector(cube5, zLine) === zLine4Color &&
            (this.getFaceColorByVector(cube5, xLine) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            this.rotate401Opposite(rotateNum);
            return;
        } else if (this.getFaceColorByVector(cube3, xLineAd) === zLine4Color &&
            (this.getFaceColorByVector(cube3, zLine) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            const tempNum = rotateNum - 1;
            this.rotate402(tempNum, () => {
            this.U(tempNum, () => {
                this.rotate401(tempNum);
            });
            });
            return;
        } else if (this.getFaceColorByVector(cube23, xLine) === zLine4Color &&
            (this.getFaceColorByVector(cube23, zLineAd) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            this.rotate402Opposite(rotateNum - 3);
            return;
        } else if (this.getFaceColorByVector(cube23, zLineAd) === zLine4Color &&
            (this.getFaceColorByVector(cube23, xLine) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            this.rotate402Opposite(rotateNum - 3);
            return;
        } else if (this.getFaceColorByVector(cube5, xLine) === zLine4Color &&
            (this.getFaceColorByVector(cube5, zLine) === xLineAd6Color || rotateNum === this.startFaceNo)) {
            this.rotate402Opposite(rotateNum);
            return;
        } else if ((this.getFaceColorByVector(cube21, xLineAd) === zLine4Color || 
            this.getFaceColorByVector(cube21, zLineAd) === zLine4Color) && rotateNum <= 0) {
            this.rotate402Opposite(rotateNum - 2);
            return;
        }
        }
        
        // Check right edge
        if (this.getFaceColorByVector(cube5, zLine) !== zLine4Color) {
        if (this.getFaceColorByVector(cube11, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube11, xLine) === xLine14Color || rotateNum !== this.endFaceNo)) {
            this.rotate401(rotateNum);
            return;
        } else if (this.getFaceColorByVector(cube11, xLine) === zLine4Color &&
            (this.getFaceColorByVector(cube11, this.YLine) === xLine14Color || rotateNum !== this.endFaceNo)) {
            this.U(0, () => {
            this.rotate402(rotateNum);
            });
            return;
        } else if ((this.getFaceColorByVector(cube1, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube1, zLine) === xLine14Color || rotateNum !== this.endFaceNo)) ||
            (this.getFaceColorByVector(cube1, zLine) === zLine4Color &&
            (this.getFaceColorByVector(cube1, this.YLine) === xLine14Color || rotateNum !== this.endFaceNo)) ||
            (this.getFaceColorByVector(cube9, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube9, xLineAd) === xLine14Color || rotateNum !== this.endFaceNo)) ||
            (this.getFaceColorByVector(cube9, xLineAd) === zLine4Color &&
            (this.getFaceColorByVector(cube9, this.YLine) === xLine14Color || rotateNum !== this.endFaceNo)) ||
            (this.getFaceColorByVector(cube19, this.YLine) === zLine4Color &&
            (this.getFaceColorByVector(cube19, zLineAd) === xLine14Color || rotateNum !== this.endFaceNo)) ||
            (this.getFaceColorByVector(cube19, zLineAd) === zLine4Color &&
            (this.getFaceColorByVector(cube19, this.YLine) === xLine14Color || rotateNum !== this.endFaceNo))) {
            this.u(0);
            return;
        } else if (this.getFaceColorByVector(cube5, xLine) === zLine4Color &&
            (this.getFaceColorByVector(cube5, zLine) === xLine14Color || rotateNum !== this.endFaceNo)) {
            this.rotate402Opposite(rotateNum);
            return;
        } else if ((this.getFaceColorByVector(cube21, xLineAd) === zLine4Color || 
            this.getFaceColorByVector(cube21, zLineAd) === zLine4Color) && rotateNum <= 0) {
            this.rotate402Opposite(rotateNum - 2);
            return;
        } else if (this.getFaceColorByVector(cube23, zLineAd) === zLine4Color && 
            rotateNum === this.startFaceNo) {
            this.rotate402Opposite(rotateNum - 3);
            return;
        } else if (this.getFaceColorByVector(cube23, xLine) === zLine4Color &&
            (this.getFaceColorByVector(cube23, zLineAd) === xLine14Color || rotateNum !== this.endFaceNo)) {
            this.rotate402Opposite(rotateNum - 3);
            return;
        }
        }
        
        if (this.getFaceColorByVector(cube3, zLine) !== zLine4Color || 
            this.getFaceColorByVector(cube5, zLine) !== zLine4Color) {
        this.startFaceNo = this.currentFaceNo;
        if (this.startFaceNo > 0) {
            this.endFaceNo = this.startFaceNo - 1;
        } else {
            this.endFaceNo = 3;
        }
        } else {
        this.currentFaceNo++;
        if (this.currentFaceNo > 3) {
            this.currentFaceNo = 0;
        }
        }
        this.step4();
    }
    }

    // Step 5: Top Cross
    step5() {
      if (this.checkStep5()) {
        console.log('Step 5 complete');
        this.currentStep = 6;
        this.uiCallbacks.setCurrentStep('Step 6: Position Top Corners');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 5: Top Cross');
      
      for (let i = 0; i < 4; i++) {
        this.step5Case1(i);
        this.step5Case2(i);
        this.step5Case3(i);
      }
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 5');
        this.showError('Error in Step 5');
      }
    }

    checkStep5() {
    if (!this.checkStep4()) {
        return false;
    }
    
    const cube1 = this.getCubeByIndex(1);
    const cube11 = this.getCubeByIndex(11);
    const cube9 = this.getCubeByIndex(9);
    const cube19 = this.getCubeByIndex(19);
    const cube10 = this.getCubeByIndex(10);
    
    if (this.getFaceColorByVector(cube10, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube1, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube11, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube9, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube19, this.YLine) !== this.topColor) {
        return false;
    }
    
    return true;
    }

    rotate501(rotateNum, next) {
    // rufUFR
    const arr = [this.r, this.u, this.f, this.U, this.F, this.R];
    this.runMethodAtNo(arr, 0, rotateNum, next);
    }

    rotate502(rotateNum, next) {
    // rfuFUR
    const arr = [this.r, this.f, this.u, this.F, this.U, this.R];
    this.runMethodAtNo(arr, 0, rotateNum, next);
    }

    step5Case1(rotateNum) {
    if (!this.isRotating) {
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube9 = this.getCubeByIndex(9, rotateNum);
        const cube19 = this.getCubeByIndex(19, rotateNum);
        const cube10 = this.getCubeByIndex(10, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube10, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube9, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube19, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube1, zLine) === this.topColor &&
            this.getFaceColorByVector(cube11, xLine) === this.topColor) {
        this.rotate501(rotateNum);
        }
    }
    }

    step5Case2(rotateNum) {
    if (!this.isRotating) {
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube19 = this.getCubeByIndex(19, rotateNum);
        const cube10 = this.getCubeByIndex(10, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube10, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube1, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube19, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube11, xLine) === this.topColor) {
        this.rotate501(rotateNum);
        }
    }
    }

    step5Case3(rotateNum) {
    if (!this.isRotating) {
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube10 = this.getCubeByIndex(10, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube10, this.YLine) === this.topColor &&
            this.getFaceColorByVector(cube1, zLine) === this.topColor &&
            this.getFaceColorByVector(cube11, xLine) === this.topColor) {
        this.rotate501(rotateNum, () => {
            this.U(rotateNum, () => {
            this.rotate502(rotateNum);
            });
        });
        }
    }
    }

    // Step 6: Position Top Corners
    step6() {
      if (this.checkStep6()) {
        console.log('Step 6 complete');
        this.currentStep = 7;
        this.uiCallbacks.setCurrentStep('Step 7: Orient Top Edges');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 6: Position Top Corners');
      
      for (let i = 0; i < 4; i++) {
        this.step6Case1(i);
      }
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 6');
        this.showError('Error in Step 6');
      }
    }

    checkStep6() {
    if (!this.checkStep5()) {
        return false;
    }
    
    const cube0 = this.getCubeByIndex(0);
    const cube2 = this.getCubeByIndex(2);
    const cube18 = this.getCubeByIndex(18);
    const cube20 = this.getCubeByIndex(20);
    
    if (this.getFaceColorByVector(cube0, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube2, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube18, this.YLine) !== this.topColor ||
        this.getFaceColorByVector(cube20, this.YLine) !== this.topColor) {
        return false;
    }
    
    return true;
    }

    rotate601(rotateNum) {
    // rULuRUlu
    const arr = [this.r, this.U, this.L, this.u, this.R, this.U, this.l, this.u];
    this.runMethodAtNo(arr, 0, rotateNum);
    }

    rotate602(rotateNum) {
    // ULurUluR
    const arr = [this.U, this.L, this.u, this.r, this.U, this.l, this.u, this.R];
    this.runMethodAtNo(arr, 0, rotateNum);
    }

    rotate603(rotateNum) {
    // RUrURUUr
    const arr = [this.R, this.U, this.r, this.U, this.R, this.U, this.U, this.r];
    this.runMethodAtNo(arr, 0, rotateNum);
    }

    step6Case1(rotateNum) {
    if (!this.isRotating) {
        const cube0 = this.getCubeByIndex(0, rotateNum);
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const cube20 = this.getCubeByIndex(20, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube0, zLine) === this.topColor &&
            this.getFaceColorByVector(cube2, xLine) === this.topColor) {
        this.rotate601(rotateNum);
        } else if (this.getFaceColorByVector(cube2, zLine) === this.topColor &&
            this.getFaceColorByVector(cube20, xLine) === this.topColor) {
        this.rotate602(rotateNum);
        } else if (this.getFaceColorByVector(cube0, zLine) === this.topColor) {
        this.rotate603(rotateNum);
        }
    }
    }

    // Step 7: Orient Top Edges
    step7() {
      if (this.checkStep7()) {
        console.log('Step 7 complete');
        this.currentStep = 8;
        this.uiCallbacks.setCurrentStep('Step 8: Final Orient Corners');
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 7: Orient Top Edges');
      
      for (let i = 0; i < 4; i++) {
        this.step7Case1(i);
        this.step7Case2(i);
      }
      
      this.step7Case3();
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 7');
        this.showError('Error in Step 7');
      }
    }

    checkStep7() {
    if (!this.checkStep6()) {
        return false;
    }
    
    const cube1 = this.getCubeByIndex(1);
    const cube4 = this.getCubeByIndex(4);
    const cube11 = this.getCubeByIndex(11);
    const cube14 = this.getCubeByIndex(14);
    const cube19 = this.getCubeByIndex(19);
    const cube22 = this.getCubeByIndex(22);
    const cube9 = this.getCubeByIndex(9);
    const cube12 = this.getCubeByIndex(12);
    
    if (this.getFaceColorByVector(cube1, this.ZLine) !== this.getFaceColorByVector(cube4, this.ZLine) ||
        this.getFaceColorByVector(cube11, this.XLine) !== this.getFaceColorByVector(cube14, this.XLine) ||
        this.getFaceColorByVector(cube19, this.ZLineAd) !== this.getFaceColorByVector(cube22, this.ZLineAd) ||
        this.getFaceColorByVector(cube9, this.XLineAd) !== this.getFaceColorByVector(cube12, this.XLineAd)) {
        return false;
    }
    
    return true;
    }

    step7Case1(rotateNum) {
    if (!this.isRotating) {
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine4Color = this.getFaceColorByVector(cube4, zLine);
        
        if (this.getFaceColorByVector(cube1, zLine) !== zLine4Color &&
            zLine4Color === this.getFaceColorByVector(cube11, xLine) &&
            zLine4Color !== this.getFaceColorByVector(cube14, xLine)) {
        this.F(rotateNum, () => {
            this.F(rotateNum, () => {
            this.U(rotateNum, () => {
                this.r(rotateNum, () => {
                this.L(rotateNum, () => {
                    this.F(rotateNum, () => {
                    this.F(rotateNum, () => {
                        this.R(rotateNum, () => {
                        this.l(rotateNum, () => {
                            this.U(rotateNum, () => {
                            this.F(rotateNum, () => {
                                this.F(rotateNum);
                            });
                            });
                        });
                        });
                    });
                    });
                });
                });
            });
            });
        });
        }
    }
    }

    step7Case2(rotateNum) {
    if (!this.isRotating) {
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube4 = this.getCubeByIndex(4, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube14 = this.getCubeByIndex(14, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine1Color = this.getFaceColorByVector(cube1, zLine);
        
        if (zLine1Color !== this.getFaceColorByVector(cube4, zLine) &&
            zLine1Color === this.getFaceColorByVector(cube14, xLine) &&
            zLine1Color !== this.getFaceColorByVector(cube11, xLine)) {
        this.F(rotateNum, () => {
            this.F(rotateNum, () => {
            this.u(rotateNum, () => {
                this.r(rotateNum, () => {
                this.L(rotateNum, () => {
                    this.F(rotateNum, () => {
                    this.F(rotateNum, () => {
                        this.R(rotateNum, () => {
                        this.l(rotateNum, () => {
                            this.u(rotateNum, () => {
                            this.F(rotateNum, () => {
                                this.F(rotateNum);
                            });
                            });
                        });
                        });
                    });
                    });
                });
                });
            });
            });
        });
        }
    }
    }

    step7Case3() {
    if (!this.isRotating && !this.checkStep7()) {
        this.u(0);
    }
    }

    // Step 8: Final Orient Corners
    step8() {
      if (this.checkStep8()) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        this.endTime = performance.now();
        console.log('Cube solved!');
        console.log('Total time: ' + (this.endTime - this.startTime) + 'ms');
        console.log('Total steps: ' + this.stepCount);
        this.uiCallbacks.setCurrentStep('Solved!');
        this.uiCallbacks.setCurrentMove('Complete');
        this.uiCallbacks.setMoveSequence(`Solved in ${this.moveCount} moves`);
        return;
      }
      
      this.uiCallbacks.setCurrentStep('Step 8: Final Orient Corners');
      
      for (let i = 0; i < 4; i++) {
        this.step8Case1(i);
        this.step8Case2(i);
      }
      
      this.step8Case3();
      
      if (!this.isRotating) {
        this.isAutoSolve = false;
        this.setStepSolveActive(false);
        console.log('Something wrong in step 8');
        this.showError('Error in Step 8');
      }
    }

    checkStep8() {
    if (!this.cubes || this.cubes.length === 0) {
        return false;
    }
    const checkStep8Item = (indexs, line) => {
        if (indexs.length > 0) {
        const arr = this.getCubeByIndexs(indexs);
        const color = this.getFaceColorByVector(arr[0], line);
        for (let i = 1; i < arr.length; i++) {
            if (this.getFaceColorByVector(arr[i], line) !== color) {
            return false;
            }
        }
        }
        return true;
    };
    
    let result = true;
    
    const indexs1 = [1, 0, 2, 3, 4, 5, 6, 7, 8];
    result = checkStep8Item(indexs1, this.ZLine);
    if (!result) return result;
    
    const indexs2 = [11, 14, 17, 20, 23, 26, 2, 5, 8];
    result = checkStep8Item(indexs2, this.XLine);
    if (!result) return result;
    
    const indexs3 = [19, 18, 21, 22, 24, 25, 20, 23, 26];
    result = checkStep8Item(indexs3, this.ZLineAd);
    if (!result) return result;
    
    const index4 = [9, 0, 3, 6, 12, 15, 18, 21, 24];
    result = checkStep8Item(index4, this.XLineAd);
    
    return result;
    }

    rotate801(rotateNum) {
    // RRBBRFrBBRfR
    const arr = [
        this.R, this.R, this.B, this.B, this.R, this.F, 
        this.r, this.B, this.B, this.R, this.f, this.R
    ];
    this.runMethodAtNo(arr, 0, rotateNum);
    }

    rotate802(rotateNum) {
    // LLBBlfLBBlFl
    const arr = [
        this.L, this.L, this.B, this.B, this.l, this.f, 
        this.L, this.B, this.B, this.l, this.F, this.l
    ];
    this.runMethodAtNo(arr, 0, rotateNum);
    }

    step8Case1(rotateNum) {
    if (!this.isRotating) {
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const cube20 = this.getCubeByIndex(20, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        
        if (this.getFaceColorByVector(cube2, xLine) === this.getFaceColorByVector(cube20, xLine) &&
            this.getFaceColorByVector(cube2, xLine) !== this.getFaceColorByVector(cube11, xLine)) {
        this.rotate801(rotateNum);
        }
    }
    }

    step8Case2(rotateNum) {
    if (!this.isRotating) {
        const cube0 = this.getCubeByIndex(0, rotateNum);
        const cube1 = this.getCubeByIndex(1, rotateNum);
        const cube2 = this.getCubeByIndex(2, rotateNum);
        const cube11 = this.getCubeByIndex(11, rotateNum);
        const cube20 = this.getCubeByIndex(20, rotateNum);
        const xLine = this.rotateAxisByYLine(this.XLine, rotateNum);
        const zLine = this.rotateAxisByYLine(this.ZLine, rotateNum);
        
        if (this.getFaceColorByVector(cube0, zLine) === this.getFaceColorByVector(cube20, xLine) &&
            this.getFaceColorByVector(cube1, zLine) === this.getFaceColorByVector(cube2, zLine) &&
            this.getFaceColorByVector(cube11, xLine) === this.getFaceColorByVector(cube20, xLine) &&
            this.getFaceColorByVector(cube0, zLine) !== this.getFaceColorByVector(cube1, zLine) &&
            this.getFaceColorByVector(cube20, xLine) !== this.getFaceColorByVector(cube20, xLine)) {
        this.rotate802(rotateNum);
        }
    }
    }

    step8Case3() {
    if (!this.isRotating) {
        const cube0 = this.getCubeByIndex(0);
        const cube2 = this.getCubeByIndex(2);
        const cube20 = this.getCubeByIndex(20);
        const cube18 = this.getCubeByIndex(18);
        
        if (this.getFaceColorByVector(cube0, this.ZLine) !== this.getFaceColorByVector(cube2, this.ZLine) &&
            this.getFaceColorByVector(cube2, this.XLine) !== this.getFaceColorByVector(cube20, this.XLine) &&
            this.getFaceColorByVector(cube20, this.ZLineAd) !== this.getFaceColorByVector(cube18, this.ZLineAd) &&
            this.getFaceColorByVector(cube18, this.XLineAd) !== this.getFaceColorByVector(cube0, this.XLineAd)) {
        this.rotate801(0);
        }
    }
    }

}

export default RubiksCube;