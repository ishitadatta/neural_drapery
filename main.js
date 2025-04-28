// main.js — sets up cloth particles, simulation, and drag interaction

import { Vec3, Particle, Spring } from './sim_webgl/cloth.js';
import { XPBDClothSim } from './sim_webgl/sim.js';


let canvas, ctx;
let particles = [], springs = [];
let sim;
let dragging = null;
let mousePos = new Vec3();

const gridWidth = 20;
const gridHeight = 20;
const spacing = 15;

function createCloth() {
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const pos = new Vec3(x * spacing + 100, y * spacing + 50, 0);
      const fixed = y === 0;
      particles.push(new Particle(pos, 1.0, fixed));
    }
  }

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const i = y * gridWidth + x;
      if (x < gridWidth - 1) {
        const right = i + 1;
        springs.push(new Spring(particles[i], particles[right], spacing, 0.8));
      }
      if (y < gridHeight - 1) {
        const below = i + gridWidth;
        springs.push(new Spring(particles[i], particles[below], spacing, 0.8));
      }
    }
  }

  sim = new XPBDClothSim(particles, springs);
}

function drawCloth() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#3498db';
  ctx.strokeStyle = '#888';

  for (const s of springs) {
    ctx.beginPath();
    ctx.moveTo(s.p1.pos.x, s.p1.pos.y);
    ctx.lineTo(s.p2.pos.x, s.p2.pos.y);
    ctx.stroke();
  }

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animate() {
  if (dragging) {
    dragging.pos = mousePos;
  }
  sim.step();
  drawCloth();
  requestAnimationFrame(animate);
}

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return new Vec3(evt.clientX - rect.left, evt.clientY - rect.top, 0);
}

function findNearestParticle(mouse) {
  let nearest = null;
  let minDist = Infinity;
  for (const p of particles) {
    const dx = p.pos.x - mouse.x;
    const dy = p.pos.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20 && dist < minDist) {
      minDist = dist;
      nearest = p;
    }
  }
  return nearest;
}

window.onload = () => {
  canvas = document.getElementById('cloth-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  createCloth();
  animate();

  canvas.addEventListener('mousedown', (e) => {
    mousePos = getMousePos(e);
    const p = findNearestParticle(mousePos);
    if (p) {
      dragging = p;
      dragging.fixed = true;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    mousePos = getMousePos(e);
  });

  canvas.addEventListener('mouseup', () => {
    if (dragging) {
      dragging.fixed = false;
      dragging = null;
    }
  });
};