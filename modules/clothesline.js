// modules/Clothesline.js

export function drawClothesline(gl, clothes) {
    // === Draw the clothesline ===
    const lineProgram = createLineProgram(gl);
    gl.useProgram(lineProgram);
  
    const linePositions = new Float32Array([-1.0, 0.3, 1.0, 0.3]);
    const lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.STATIC_DRAW);
  
    const lineAttrib = gl.getAttribLocation(lineProgram, 'aPosition');
    gl.enableVertexAttribArray(lineAttrib);
    gl.vertexAttribPointer(lineAttrib, 2, gl.FLOAT, false, 0, 0);
  
    gl.drawArrays(gl.LINES, 0, 2);
  
    // === Draw clips on fixed particles ===
    // === Draw the clips ===
const clipProgram = createClipProgram(gl);
gl.useProgram(clipProgram);

const clipPositions = [];

for (const cloth of clothes) {
  // Get all fixed particles in the top row
  const fixed = cloth.particles.filter(p => p.fixed);

  if (fixed.length >= 2) {
    // Sort fixed by x-position
    fixed.sort((a, b) => a.pos[0] - b.pos[0]);

    // Push only the leftmost and rightmost fixed positions
    clipPositions.push(fixed[0].pos[0], fixed[0].pos[1]);
    clipPositions.push(fixed[fixed.length - 1].pos[0], fixed[fixed.length - 1].pos[1]);
  }
}

  
    const clipBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, clipBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(clipPositions), gl.STATIC_DRAW);
  
    const clipAttrib = gl.getAttribLocation(clipProgram, 'aPosition');
    gl.enableVertexAttribArray(clipAttrib);
    gl.vertexAttribPointer(clipAttrib, 2, gl.FLOAT, false, 0, 0);
  
    gl.drawArrays(gl.POINTS, 0, clipPositions.length / 2);
  }
  
  function createLineProgram(gl) {
    const vs = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const fs = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.4, 0.2, 0.1, 1.0); // brown
      }
    `;
    return compileAndLink(gl, vs, fs);
  }
  
  function createClipProgram(gl) {
    const vsSource = `
      attribute vec2 aPosition;
      void main() {
        gl_PointSize = 20.0;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
  
    const fsSource = `
      precision mediump float;
      void main() {
        vec2 uv = gl_PointCoord;
        vec2 centered = uv * 2.0 - 1.0;
  
        float dist = length(centered);
        if (dist > 1.0) discard;
  
        // Basic clip shape shading
        float body = smoothstep(1.0, 0.95, dist);
        
        // Pinch effect in center
        float pinch = 1.0 - smoothstep(0.05, 0.0, abs(uv.y - 0.5)) * smoothstep(0.25, 0.0, abs(uv.x - 0.5));
        
        // Top notch
        float notch = smoothstep(0.02, 0.0, abs(uv.x - 0.5)) * step(uv.y, 0.3);
  
        // Gloss highlight at top-left
        float gloss = smoothstep(0.1, 0.0, distance(uv, vec2(0.3, 0.7)));
  
        // Final color
        vec3 base = mix(vec3(0.25, 0.25, 0.25), vec3(0.1), notch);
        base += vec3(0.2) * gloss;
        base *= pinch;
  
        gl_FragColor = vec4(base, body);
      }
    `;
  
    return compileAndLink(gl, vsSource, fsSource);
  }
  
  
  function compileAndLink(gl, vsSrc, fsSrc) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSrc);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(vs));
    }
  
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fs));
    }
  
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
  
    return program;
  }
  