export class ClothPhysics {
    constructor(gl, xOffset = 0.0, type = "towel") {
      this.gl = gl;
      this.offset = xOffset;
      this.type = type;
  
      this.cols = 12;
      this.rows = (type === "shorts") ? 6 : 8; 
      this.spacing = 0.04;
      this.gravity = [0, -0.02];
      this.windStrength = 0.02;
  
      this.particles = [];
      this.springs = [];
  
      this.initParticles();
      this.initSprings();
  
      this.vertexShader = createSimpleVertexShader(gl);
      this.fragmentShader = createSimpleFragmentShader(gl);
      this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
  
      this.positionBuffer = gl.createBuffer();
      this.uvBuffer = gl.createBuffer();
    }
  
    initParticles() {
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const fixed = this.isFixedPoint(x, y);
          const baseX = this.offset + (-0.3 + x * this.spacing);
          const baseY = 0.3 - y * this.spacing;
          this.particles.push({
            pos: [baseX, baseY],
            prev: [baseX, baseY],
            uv: [x / (this.cols - 1), y / (this.rows - 1)],
            fixed: fixed
          });
        }
      }
    }
  
    isFixedPoint(x, y) {
      if (y !== 0) return false; 
  
      if (this.type === "towel") {
        return true; 
      } else if (this.type === "tshirt") {
        return (x >= 4 && x <= 7); 
      } else if (this.type === "shorts") {
        return (x >= 3 && x <= 8); 
      }
      return true;
    }
  
    initSprings() {
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const i = y * this.cols + x;
          if (x < this.cols - 1) this.springs.push({ indices: [i, i + 1], restLength: this.spacing, stiffness: 1.0 });
          if (y < this.rows - 1) this.springs.push({ indices: [i, i + this.cols], restLength: this.spacing, stiffness: 1.0 });
          if (x < this.cols - 1 && y < this.rows - 1) {
            this.springs.push({ indices: [i, i + this.cols + 1], restLength: Math.sqrt(2) * this.spacing, stiffness: 0.5 });
          }
          if (x > 0 && y < this.rows - 1) {
            this.springs.push({ indices: [i, i + this.cols - 1], restLength: Math.sqrt(2) * this.spacing, stiffness: 0.5 });
          }
          if (x < this.cols - 2) this.springs.push({ indices: [i, i + 2], restLength: 2 * this.spacing, stiffness: 0.2 });
          if (y < this.rows - 2) this.springs.push({ indices: [i, i + this.cols * 2], restLength: 2 * this.spacing, stiffness: 0.2 });
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
  
          p.pos[0] += vx * 0.99;
          p.pos[1] += vy * 0.99;
  
          p.pos[0] += this.gravity[0];
          p.pos[1] += this.gravity[1];
  
          const wind = (Math.sin(Date.now() * 0.003 + p.pos[1] * 20.0) + Math.random() * 0.5) * this.windStrength;
          p.pos[0] += wind;
        }
      }
  
      for (let s = 0; s < 5; s++) {
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
      const uvs = [];
  
      for (let y = 0; y < this.rows - 1; y++) {
        for (let x = 0; x < this.cols - 1; x++) {
          const i = y * this.cols + x;
          const p0 = this.particles[i];
          const p1 = this.particles[i + 1];
          const p2 = this.particles[i + this.cols];
          const p3 = this.particles[i + this.cols + 1];
  
          
          positions.push(p0.pos[0], p0.pos[1]);
          uvs.push(p0.uv[0], p0.uv[1]);
  
          positions.push(p1.pos[0], p1.pos[1]);
          uvs.push(p1.uv[0], p1.uv[1]);
  
          positions.push(p2.pos[0], p2.pos[1]);
          uvs.push(p2.uv[0], p2.uv[1]);
  
          
          positions.push(p2.pos[0], p2.pos[1]);
          uvs.push(p2.uv[0], p2.uv[1]);
  
          positions.push(p1.pos[0], p1.pos[1]);
          uvs.push(p1.uv[0], p1.uv[1]);
  
          positions.push(p3.pos[0], p3.pos[1]);
          uvs.push(p3.uv[0], p3.uv[1]);
        }
      }
  
      gl.useProgram(this.program);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
      const posLoc = gl.getAttribLocation(this.program, 'aPosition');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
      const uvLoc = gl.getAttribLocation(this.program, 'aUv');
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
  
      gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }
  }
  
  // ==============================
  // SHADERS
  // ==============================
  function createSimpleVertexShader(gl) {
    const source = `
      attribute vec2 aPosition;
      attribute vec2 aUv;
      varying vec2 vUv;
      void main() {
        vUv = aUv;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  
  function createSimpleFragmentShader(gl) {
    const source = `
      precision mediump float;
      varying vec2 vUv;
      void main() {
        float stripe = step(0.95, mod(vUv.x * 20.0, 1.0));
        vec3 pink = vec3(1.0, 0.4, 0.7);
        vec3 color = mix(vec3(1.0), pink, stripe);
        gl_FragColor = vec4(color, 1.0);
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
  