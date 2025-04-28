// modules/Clothesline.js

export function drawClothesline(gl) {
    // Setup line vertices (rope)
    const ropeVertices = new Float32Array([
      -0.5, 0.25,  // Left
       0.5, 0.25,  // Right
    ]);
  
    const ropeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ropeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ropeVertices, gl.STATIC_DRAW);
  
    const vertexShader = createSimpleVertexShader(gl);
    const fragmentShader = createSimpleFragmentShader(gl, [0.8, 0.8, 0.8]); // Light gray rope
  
    const ropeProgram = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(ropeProgram);
  
    const posAttrib = gl.getAttribLocation(ropeProgram, 'aPosition');
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
  
    gl.lineWidth(2.0);
    gl.drawArrays(gl.LINES, 0, 2);
  
    // Setup poles (vertical rectangles made of 2 triangles each)
    const poleWidth = 0.02;
    const poleHeight = 0.75;
  
    const poleLeft = new Float32Array([
      -0.5 - poleWidth/2, -1.0,
      -0.5 + poleWidth/2, -1.0,
      -0.5 + poleWidth/2, 0.25,
  
      -0.5 - poleWidth/2, -1.0,
      -0.5 + poleWidth/2, 0.25,
      -0.5 - poleWidth/2, 0.25,
    ]);
  
    const poleRight = new Float32Array([
       0.5 - poleWidth/2, -1.0,
       0.5 + poleWidth/2, -1.0,
       0.5 + poleWidth/2, 0.25,
  
       0.5 - poleWidth/2, -1.0,
       0.5 + poleWidth/2, 0.25,
       0.5 - poleWidth/2, 0.25,
    ]);
  
    drawPole(gl, poleLeft);
    drawPole(gl, poleRight);
  }
  
  function drawPole(gl, vertices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
    const vertexShader = createSimpleVertexShader(gl);
    const fragmentShader = createSimpleFragmentShader(gl, [0.36, 0.25, 0.2]); // Dark brown poles
  
    const program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
  
    const posAttrib = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
  
    gl.drawArrays(gl.TRIANGLES, 0, 6);
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
  