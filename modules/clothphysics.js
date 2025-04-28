// modules/ClothPhysics.js — corrected and enhanced version!

export class ClothPhysics {
    constructor(gl) {
      this.gl = gl;
  
      this.cols = 12;
      this.rows = 8;
      this.spacing = 0.04;
      this.gravity = [0, -0.02];
      this.windStrength = 0.02;
  
      this.particles = [];
      this.springs = [];
  
      this.initParticles();
      this.initSprings();
  
      this.vertexShader = createSimpleVertexShader(gl);
      this.fragmentShader = createSimpleFragmentShader(gl, [1.0, 1.0, 1.0]);
      this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
  
      this.positionBuffer = gl.createBuffer();
      this.positionAttribLocation = gl.getAttribLocation(this.program, 'aPosition');
    }
  
    initParticles() {
        const ropeHeight = 0.3; // Match the clothesline y-position
        const clothWidth = (this.cols - 1) * this.spacing;
        const startX = -clothWidth / 2;
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          
            this.particles.push({
            pos: [startX + x * this.spacing, ropeHeight - y * this.spacing],
            prev: [startX + x * this.spacing, ropeHeight - y * this.spacing],
            fixed: (y === 0) // Only the top row fixed
            

          });
        }
      }
    }
  
    initSprings() {
        for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
            const i = y * this.cols + x;
      
            // Structural springs
            if (x < this.cols - 1) this.springs.push({ indices: [i, i + 1], restLength: this.spacing, stiffness: 1.0 });
            if (y < this.rows - 1) this.springs.push({ indices: [i, i + this.cols], restLength: this.spacing, stiffness: 1.0 });
      
            // Shear springs
            if (x < this.cols - 1 && y < this.rows - 1) {
              this.springs.push({ indices: [i, i + this.cols + 1], restLength: Math.sqrt(2) * this.spacing, stiffness: 0.5 });
            }
            if (x > 0 && y < this.rows - 1) {
              this.springs.push({ indices: [i, i + this.cols - 1], restLength: Math.sqrt(2) * this.spacing, stiffness: 0.5 });
            }
      
            // Bend springs
            if (x < this.cols - 2) this.springs.push({ indices: [i, i + 2], restLength: this.spacing * 2, stiffness: 0.2 });
            if (y < this.rows - 2) this.springs.push({ indices: [i, i + this.cols * 2], restLength: this.spacing * 2, stiffness: 0.2 });
          }
        }
      }
      
      
  
    simulate() {
      for (const p of this.particles) {
        if (!p.fixed) {
          const vx = p.pos[0] - p.prev[0];
          const vy = p.pos[1] - p.prev[1];
  
          p.prev[0] = p.pos[0];
          p.prev[1] = p.pos[1];
  
          p.pos[0] += vx * 0.99; // damping
          p.pos[1] += vy * 0.99;
  
          p.pos[0] += this.gravity[0];
          p.pos[1] += this.gravity[1];
  
          const wind = (Math.sin(Date.now() * 0.003 + p.pos[1] * 20.0) + Math.random() * 0.5) * this.windStrength;
          p.pos[0] += wind;
        }
      }
  
      for (let s = 0; s < 5; s++) { // 5 constraint iterations
        for (const spring of this.springs) {
          const [i1, i2] = spring.indices;
          const p1 = this.particles[i1];
          const p2 = this.particles[i2];
      
          const dx = p2.pos[0] - p1.pos[0];
          const dy = p2.pos[1] - p1.pos[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
      
          const diff = (dist - spring.restLength) / dist;
          const correction = 0.5 * diff * spring.stiffness;
      
          if (!p1.fixed) {
            p1.pos[0] += correction * dx;
            p1.pos[1] += correction * dy;
          }
          if (!p2.fixed) {
            p2.pos[0] -= correction * dx;
            p2.pos[1] -= correction * dy;
          }
        }
      }      
    }
  
    draw() {
      const gl = this.gl;
  
      const positions = [];
      for (let y = 0; y < this.rows - 1; y++) {
        for (let x = 0; x < this.cols - 1; x++) {
          const i = y * this.cols + x;
          const p0 = this.particles[i];
          const p1 = this.particles[i + 1];
          const p2 = this.particles[i + this.cols];
          const p3 = this.particles[i + this.cols + 1];
  
          positions.push(
            p0.pos[0], p0.pos[1],
            p1.pos[0], p1.pos[1],
            p2.pos[0], p2.pos[1],
  
            p2.pos[0], p2.pos[1],
            p1.pos[0], p1.pos[1],
            p3.pos[0], p3.pos[1]
          );
        }
      }
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  
      gl.useProgram(this.program);
      gl.enableVertexAttribArray(this.positionAttribLocation);
      gl.vertexAttribPointer(this.positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
  
      gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }
  }
  
  function createSimpleVertexShader(gl) {
    const source = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  
  function createSimpleFragmentShader(gl, color) {
    const source = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(${color[0]}, ${color[1]}, ${color[2]}, 1.0);
      }
    `;
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  
  function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
  }