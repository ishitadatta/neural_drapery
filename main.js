import { initBackground } from './modules/background.js';
import { initGround } from './modules/ground.js';
import { drawClothesline } from './modules/clothesline.js';
import { ClothPhysics } from './modules/clothphysics.js';

let canvas, gl;
let backgroundProgram, groundProgram;
let clothes = []; // IMPORTANT: an array, NOT a single variable
let backgroundBuffer, groundBuffer;

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

  // --- INIT background and SAVE BOTH program and buffer ---
  const background = await initBackground(gl);
  backgroundProgram = background.program;
  backgroundBuffer = background.buffer;   // <<< ADD THIS

  // --- INIT ground and SAVE BOTH program and buffer ---
  const ground = await initGround(gl);
  groundProgram = ground.program;
  groundBuffer = ground.buffer;           // <<< ADD THIS

  clothes = [];

  clothes.push(new ClothPhysics(gl, -0.6, "towel"));
  clothes.push(new ClothPhysics(gl, 0.0, "tshirt"));
  clothes.push(new ClothPhysics(gl, 0.6, "shorts"));

  console.log("Created clothes array:", clothes);
  for (const cloth of clothes) {
    console.log(" - Cloth at offset", cloth.offset, "of type", cloth.type);
  }

  render();
}



function render() {
  console.log("Rendering frame...");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // --- Draw background ---
  gl.useProgram(backgroundProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
  const bgAttribLoc = gl.getAttribLocation(backgroundProgram, 'aPosition');
  gl.enableVertexAttribArray(bgAttribLoc);
  gl.vertexAttribPointer(bgAttribLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // --- Draw ground ---
  gl.useProgram(groundProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
  const groundAttribLoc = gl.getAttribLocation(groundProgram, 'aPosition');
  gl.enableVertexAttribArray(groundAttribLoc);
  gl.vertexAttribPointer(groundAttribLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // --- Draw clothesline ---
  drawClothesline(gl);

  // --- Simulate and draw each cloth ---
  for (const cloth of clothes) {
    console.log("Rendering", clothes.length, "clothes...");
    cloth.simulate();
    cloth.draw();
  }

  requestAnimationFrame(render);
}


init();
