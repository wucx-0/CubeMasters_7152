// Initialize Three.js components
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
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
    1000
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

// Utility function, convert degree to rad
const degree = (angle) => angle * (Math.PI / 180);

// Cube class
class RubiksCube {
    constructor(order = 3) {
        if(order>10) {
            throw new Error("Maximum cube size exceeded!");
        }
        this.axisX = new THREE.Vector3(1,0,0);
        this.axisY = new THREE.Vector3(0,1,0);
        this.axisZ = new THREE.Vector3(0,0,1);

        this.order = order;
        this.pieceSize = 3;
        this.gap = 0.1;
        this.alreadyWon=false;
        this.shuffling=false;
        this.rotating = false;
        this.editMode = true;
        this.colors = [
            0xff0000, // Red (Right)
            0x00ff00, // Green (Front)
            0x0000ff, // Blue (Back)
            0xffff00, // Yellow (Down)
            0xff8c00, // Orange (Left)
            0xffffff  // White (Up)
        ];
        this.offset = ((order - 1) * (this.pieceSize + this.gap)) / 2;
        this.blocks = [];
        this.mergeObj=[];

        for(let i=0;i<order;i++){
            let sclice=[];
            for(let j=0;j<order;j++){
                let row=[];
                for(let k=0;k<order;k++){
                    let piece ={x:i*this.pieceSize - this.offset,y:j*this.pieceSize - this.offset,z:k*this.pieceSize - this.offset};
                    row.push({...piece});
                }
                sclice.push({...row})
            }
            this.blocks.push({...sclice})
        }
        this.initialize();
    }

    initialize() {
        for (let x = 0; x < this.order; x++) {
            for (let y = 0; y < this.order; y++) {
                for (let z = 0; z < this.order; z++) {
                    const piece = this.createPiece(x, y, z);
                    this.blocks[x][y][z].piece = piece;
                }
            }
        }
    }

    createPiece(x, y, z) {
        const pieceGroup = new THREE.Object3D();
        pieceGroup.name = ` ${x}${y}${z}`;

        // Calculate position with gap
        const posX = x * (this.pieceSize + this.gap) - this.offset;
        const posY = y * (this.pieceSize + this.gap) - this.offset;
        const posZ = z * (this.pieceSize + this.gap) - this.offset;

        // Create the core cube
        pieceGroup.position.set(posX, posY, posZ);

        const geometry = new THREE.BoxGeometry(
            this.pieceSize,
            this.pieceSize,
            this.pieceSize
        );
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.7
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        pieceGroup.add(cube);

        // Create colored faces (only on outer surfaces)
        const faceSize = this.pieceSize * 0.95;
        const faceOffset = this.pieceSize / 2 + 0.05;

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
        scene.add(pieceGroup);

        return pieceGroup;
    }

    createFace(color, size) {
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            roughness: 0.2,
            metalness: 0.1
        });
        const face = new THREE.Mesh(geometry, material);
        face.castShadow = true;
        face.receiveShadow = true;
        return face;
    }

    get3DCoordinate(piece) {
        for(let i = 0; i < this.order; i++) {
            for(let j = 0; i < this.order; j++) {
                for(let k = 0; k < this.order; k++) {
                    if(this.block[i][j][k].piece.name == piece.name) {
                        return {x:i, y:j, z:k};
                    }
                        
                }
            }
        }
    }

    getPiece(x, y, z) {
        if (x < 0 || x >= this.order ||
            y < 0 || y >= this.order ||
            z < 0 || z >= this.order) {
            return null;
        }
        return this.blocks[x][y][z];
    }

    rotationMatrixHelper = (i,j,direction='clockwise')=>{
        const translationOffset = (this.order - 1) / 2;
    
        const translatedI = i - translationOffset;
        const translatedJ = j - translationOffset;

        const rotatedI = translatedJ * (direction === 'clockwise'? -1: 1);
        const rotatedJ = translatedI * (direction === 'clockwise'? 1: -1);

        const x = rotatedI + translationOffset;
        const y = rotatedJ + translationOffset;
        return {x,y};
    }
    
    rotateSclice = (axis, index, direction,del=false) => {
        return new Promise((resolve, reject)=>{
            if(this.rotating) {
                console.log("Already in one rotation...!");
                return;
            }
            if(index>=this.order) 
                throw new Error('Rotation not possible on this index : '+index+' because maximum size is : '+(this.order-1));
            if('xyz'.indexOf(axis)==-1)
            throw new Error('Rotation on invalid axis: '+axis);
            let dirAngle = direction==='clockwise'?1:-1;
            let rotationAngleInterval =10;
            const tempSclice = {};
            this.rotating= true;
            switch(axis){
                case 'x':
                    for(let i=0;i<this.order;i++){
                        for(let j=0;j<this.order;j++){

                            if(del)
                            scene.remove(this.blocks[index][i][j].piece);

                            // Backing up
                            if(!tempSclice[''+i+j])
                            tempSclice[''+i+j]= this.blocks[index][i][j].piece;

                            const {x,y} = this.rotationMatrixHelper(i,j,direction=='clockwise'?'':'clockwise');
                            this.blocks[index][i][j].piece = tempSclice[''+x+y] || this.blocks[index][x][y].piece;
                        
                            let totalAngle = rotationAngleInterval;

                            const doRotationAnimation = ()=> {
                                if(totalAngle==90) {
                                    this.rotating= false;
                                    setTimeout(()=>resolve("done"), 500);
                                } else
                                requestAnimationFrame( doRotationAnimation );

                                const rotation = new THREE.Matrix4().makeRotationX(degree(rotationAngleInterval * dirAngle));
                                this.blocks[index][i][j].piece.applyMatrix(rotation);
                                totalAngle+=rotationAngleInterval;
                                };
                            doRotationAnimation();
                        }
                    }
                break;
                case 'y':
                    for(let i=0;i<this.order;i++){
                        for(let j=0;j<this.order;j++){
                            if(del)
                            scene.remove(this.blocks[i][index][j].piece);
                            // Backing up
                            if(!tempSclice[''+i+j])
                            tempSclice[''+i+j]= this.blocks[i][index][j].piece;

                            const {x,y} = this.rotationMatrixHelper(i,j,direction);
                            this.blocks[i][index][j].piece = tempSclice[''+x+y] || this.blocks[x][index][y].piece;
                        

                            let totalAngle = rotationAngleInterval;

                            const doRotationAnimation = ()=> {
                                if(totalAngle==90) {
                                    this.rotating= false;
                                    setTimeout(()=>resolve("done"), 500);
                                } else
                                requestAnimationFrame( doRotationAnimation );

                                const rotation = new THREE.Matrix4().makeRotationY(degree(rotationAngleInterval * dirAngle));
                                this.blocks[i][index][j].piece.applyMatrix(rotation);
                                    totalAngle+=rotationAngleInterval;
                                };
                            doRotationAnimation();

                        }
                    }
                break;
                case 'z':
                    for(let i=0;i<this.order;i++){
                        for(let j=0;j<this.order;j++){
                            // scene.remove(this.blocks[i][j][index].piece);
                            if(del)
                            scene.remove(this.blocks[i][j][index].piece);
                            // Backing up
                            if(!tempSclice[''+i+j])
                            tempSclice[''+i+j]= this.blocks[i][j][index].piece;

                            const {x,y} = this.rotationMatrixHelper(i,j,direction=='clockwise'?'':'clockwise');
                            this.blocks[i][j][index].piece = tempSclice[''+x+y] || this.blocks[x][y][index].piece;
                            
                            
                            let totalAngle = rotationAngleInterval;

                            const doRotationAnimation = ()=> {
                                if(totalAngle==90) {
                                    this.rotating= false;
                                    setTimeout(()=>resolve("done"), 500);
                                } else
                                requestAnimationFrame( doRotationAnimation );

                                const rotation = new THREE.Matrix4().makeRotationZ(degree(rotationAngleInterval*dirAngle));
                            this.blocks[i][j][index].piece.applyMatrix(rotation);
                                totalAngle+=rotationAngleInterval;
                                };
                            doRotationAnimation();
                        }
                    }
                break;
            }
        })
    }
    rotate = (notation)=>{
        const mapping ={
            'U': ()=>cube.rotateSclice('y',2,'anticlockwise'),
            'Uprime': ()=>cube.rotateSclice('y',2,'clockwise'),
            'D':()=>cube.rotateSclice('y',0,'clockwise'),
            'Dprime':()=>cube.rotateSclice('y',0,'anticlockwise'),
            'R':()=>cube.rotateSclice('z',0,'clockwise'),
            'Rprime':()=>cube.rotateSclice('z',0,'anticlockwise'),
            'L':()=>cube.rotateSclice('z',2,'anticlockwise'),
            'Lprime':()=>cube.rotateSclice('z',2,'clockwise'),
            'F':()=>cube.rotateSclice('x',2,'anticlockwise'),
            'Fprime':()=>cube.rotateSclice('x',2,'clockwise'),
            'B':()=>cube.rotateSclice('x',0,'clockwise'),
            'Bprime':()=>cube.rotateSclice('x',0,'anticlockwise'),
            'M':()=>cube.rotateSclice('z',1,'anticlockwise'),
            'Mprime':()=>cube.rotateSclice('z',1,'clockwise'),
            'E':()=>cube.rotateSclice('y',1,'clockwise'),
            'Eprime':()=>cube.rotateSclice('y',1,'anticlockwise'),
            'S':()=>cube.rotateSclice('x',1,'anticlockwise'),
            'Sprime':()=>cube.rotateSclice('x',1,'clockwise'),

        }
        try{
            return mapping[notation]();
        } catch(e){
            console.error('Invalid notation', e);
            console.log("step:",notation);
        }
    }
}
// Create the cube
//rubiksCube = new RubiksCube(3);u

// Animation loop

const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

const cube = new RubiksCube(3);

document.addEventListener('keydown', (event) => {
    const keyMappings = {
        'u': () => cube.rotate('U'),
        'i': () => cube.rotate('Uprime'),
        'd': () => cube.rotate('D'),
        'k': () => cube.rotate('Dprime'),
        'r': () => cube.rotate('R'),
        'y': () => cube.rotate('Rprime'),
        'l': () => cube.rotate('L'),
        'h': () => cube.rotate('Lprime'),
        'f': () => cube.rotate('F'),
        'j': () => cube.rotate('Fprime'),
        'b': () => cube.rotate('B'),
        'g': () => cube.rotate('Bprime'),
        'm': () => cube.rotate('M'),
        'n': () => cube.rotate('Mprime'),
        'e': () => cube.rotate('E'),
        'o': () => cube.rotate('Eprime'),
        's': () => cube.rotate('S'),
        'w': () => cube.rotate('Sprime')
    };
    
    if (keyMappings[event.key]) {
        keyMappings[event.key]();
    }
});

