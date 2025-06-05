class CubeUIController {
  constructor(cubeController) {
    this.cube = cubeController;
    this.initControls();
  }

  initControls() {
    // Create container for buttons
    const controls = document.createElement('div');
    controls.className = 'cube-controls';
    document.body.appendChild(controls);

    // Standard moves
    this.createButton('U', 'Up', () => this.cube.rotate('U'));
    this.createButton('D', 'Down', () => this.cube.rotate('D'));
    this.createButton('L', 'Left', () => this.cube.rotate('L'));
    this.createButton('R', 'Right', () => this.cube.rotate('R'));
    this.createButton('F', 'Front', () => this.cube.rotate('F'));
    this.createButton('B', 'Back', () => this.cube.rotate('B'));

    // Prime moves
    this.createButton('U\'', 'Up Prime', () => this.cube.rotate('Uprime'));
    this.createButton('D\'', 'Down Prime', () => this.cube.rotate('Dprime'));
    // ... add other prime moves

    // Middle layer moves
    this.createButton('M', 'Middle', () => this.cube.rotate('M'));
    this.createButton('E', 'Equator', () => this.cube.rotate('E'));
    this.createButton('S', 'Standing', () => this.cube.rotate('S'));

    // Add CSS
    this.addStyles();
  }

  createButton(notation, label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.notation = notation;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await onClick();
      } catch (error) {
        console.error(error);
      } finally {
        btn.disabled = false;
      }
    });
    document.querySelector('.cube-controls').appendChild(btn);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cube-controls {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        grid-template-columns: repeat(3, 100px);
        gap: 10px;
        padding: 15px;
        background: rgba(0,0,0,0.7);
        border-radius: 10px;
        z-index: 100;
      }
      .cube-controls button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        background: #4285f4;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cube-controls button:hover {
        background: #3367d6;
      }
      .cube-controls button:disabled {
        background: #cccccc;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }
}