import { initBackground } from './modules/background.js';
import { initGround } from './modules/ground.js';
import { drawClothesline } from './modules/clothesline.js';
import { ClothPhysics } from './modules/clothphysics.js';
import { initSuperman, drawSuperman } from './modules/superman.js';

let canvas, gl;
let backgroundProgram, groundProgram;
let clothes = []; 
let backgroundBuffer, groundBuffer;
let backgroundTimeUniform;
let supermanTexture = null;

async function init() {
  console.log("Init started");

  canvas = document.getElementById('glcanvas');
  gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  supermanTexture = loadTexture(gl, 'textures/superman.png'); 

  // Initialize background
  const bg = await initBackground(gl);
  backgroundProgram = bg.program;
  backgroundBuffer = bg.buffer;
  backgroundTimeUniform = bg.timeUniform;

  // Initialize ground
  const ground = await initGround(gl);
  groundProgram = ground.program;
  groundBuffer = ground.buffer;

  // Initialize Superman
  initSuperman(gl);

  // Initialize clothes
  clothes.push(new ClothPhysics(gl, -0.6, "towel"));
  clothes.push(new ClothPhysics(gl, 0.0, "tshirt"));
  clothes.push(new ClothPhysics(gl, 0.6, "shorts"));

  render();
}

function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Temporary pixel while loading
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);

    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  };
  image.src = url;

  return texture;
}


function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Background
  gl.useProgram(backgroundProgram);
  if (backgroundTimeUniform) {
    gl.uniform1f(backgroundTimeUniform, performance.now() * 0.001);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
  const posAttrib = gl.getAttribLocation(backgroundProgram, 'aPosition');
  gl.enableVertexAttribArray(posAttrib);
  gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Ground
  gl.useProgram(groundProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
  const groundAttribLoc = gl.getAttribLocation(groundProgram, 'aPosition');
  gl.enableVertexAttribArray(groundAttribLoc);
  gl.vertexAttribPointer(groundAttribLoc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Clothesline
  drawClothesline(gl, clothes);

  // Cloth simulation
  for (const cloth of clothes) {
    cloth.simulate();
    cloth.draw();
  }

  // Superman
  drawSuperman(gl, supermanTexture, performance.now() * 0.001);

  requestAnimationFrame(render);
}

init();
