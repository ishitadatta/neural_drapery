console.log("Loading main.js");

import { initBackground } from './modules/background.js';
import { initGround } from './modules/ground.js';
import { drawClothesline } from './modules/clothesline.js';
import { ClothPhysics } from './modules/clothphysics.js';

console.log("Imported all modules");

let canvas, gl;
let backgroundProgram, backgroundBuffer;
let groundProgram, groundBuffer;
let clothPhysics;

init();

async function init() {
  console.log("Init started");

  canvas = document.getElementById('glcanvas');
  console.log("Canvas:", canvas);

  gl = canvas.getContext('webgl');
  console.log("GL Context:", gl);

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ({ program: backgroundProgram, buffer: backgroundBuffer } = await initBackground(gl));
  console.log("BackgroundProgram =", backgroundProgram);

  ({ program: groundProgram, buffer: groundBuffer } = await initGround(gl));
  console.log("GroundProgram =", groundProgram);

  clothPhysics = new ClothPhysics(gl);
  console.log("ClothPhysics created");

  console.log("Starting render loop...");
  render();
}

function render() {
  console.log("Rendering frame...");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw background
  gl.useProgram(backgroundProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
  const positionAttrib = gl.getAttribLocation(backgroundProgram, 'aPosition');
  gl.enableVertexAttribArray(positionAttrib);
  gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Draw ground
  gl.useProgram(groundProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
  const groundPositionAttrib = gl.getAttribLocation(groundProgram, 'aPosition');
  gl.enableVertexAttribArray(groundPositionAttrib);
  gl.vertexAttribPointer(groundPositionAttrib, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Draw clothesline
  drawClothesline(gl);

  // Draw cloth
  clothPhysics.simulate();
  clothPhysics.draw();

  requestAnimationFrame(render);
}
