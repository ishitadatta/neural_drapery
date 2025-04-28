// modules/Cloth.js

export function drawCloth(gl) {
    const clothVertices = new Float32Array([
      -0.2, 0.20,
       0.2, 0.20,
       0.2, -0.1,
      -0.2, 0.20,
       0.2, -0.1,
      -0.2, -0.1,
    ]);
  
    const clothBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, clothBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, clothVertices, gl.STATIC_DRAW);
  
    const vertexShader = createSimpleVertexShader(gl);
    const fragmentShader = createSimpleFragmentShader(gl, [1.0, 1.0, 1.0]); // White cloth
  
    const clothProgram = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(clothProgram);
  
    const posAttrib = gl.getAttribLocation(clothProgram, 'aPosition');
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
  