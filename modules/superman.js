let supermanProgram, supermanBuffer, supermanTexCoordBuffer;

export function initSuperman(gl) {
  // Vertex shader
  const vs = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      vTexCoord = aTexCoord;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  // Fragment shader
  const fs = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    void main() {
      vec4 tex = texture2D(uTexture, vTexCoord);
      if (tex.a < 0.1) discard; // transparency
      gl_FragColor = tex;
    }
  `;

  const vsObj = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsObj, vs);
  gl.compileShader(vsObj);

  const fsObj = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsObj, fs);
  gl.compileShader(fsObj);

  supermanProgram = gl.createProgram();
  gl.attachShader(supermanProgram, vsObj);
  gl.attachShader(supermanProgram, fsObj);
  gl.linkProgram(supermanProgram);

  supermanBuffer = gl.createBuffer();
  supermanTexCoordBuffer = gl.createBuffer();
}

export function drawSuperman(gl, texture, time) {
  if (!supermanProgram || !texture) return;

  const speed = 1.5;
  const duration = 8.0;
  const t = (time % duration) / duration;
  if (t < 0.05 || t > 0.15) return; // Only fly by briefly

  // Superman flies from left to right
  const x = -1.2 + t * speed * 2.0;
  const y = 0.75;

  const width = 0.2;
  const height = 0.15;

  const vertices = new Float32Array([
    x, y,
    x + width, y,
    x, y - height,
    x + width, y - height,
  ]);

  const texCoords = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ]);

  gl.useProgram(supermanProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, supermanBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  const posLoc = gl.getAttribLocation(supermanProgram, 'aPosition');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, supermanTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  const texLoc = gl.getAttribLocation(supermanProgram, 'aTexCoord');
  gl.enableVertexAttribArray(texLoc);
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

  const samplerLoc = gl.getUniformLocation(supermanProgram, 'uTexture');
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(samplerLoc, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
