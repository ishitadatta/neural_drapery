// sim.js — XPBD cloth simulation engine

import { Vec3 } from './cloth.js';


export class XPBDClothSim {
    constructor(particles, springs) {
      this.particles = particles;
      this.springs = springs;
      this.gravity = new Vec3(0, -9.81, 0);
      this.timeStep = 1 / 60;
      this.iterations = 5;
    }
  
    step() {
      // Apply gravity and integrate
      for (const p of this.particles) {
        if (!p.fixed) {
          p.v.x += this.gravity.x * this.timeStep;
          p.v.y += this.gravity.y * this.timeStep;  
          p.v.z += this.gravity.z * this.timeStep;
          const wind = new Vec3(Math.sin(Date.now() * 0.001) * 30, 0, 0);
          p.v = p.v.add(this.gravity.scale(this.timeStep)).add(wind.scale(this.timeStep));
          p.prevPos = p.pos;
          p.pos = p.pos.add(p.v.scale(this.timeStep));
          
        }
      }
  
      // Solve spring constraints
      for (let i = 0; i < this.iterations; i++) {
        for (const s of this.springs) {
          s.solve();
        }
      }
  
      // Update velocities
      for (const p of this.particles) {
        if (!p.fixed) {
          p.v = p.pos.sub(p.prevPos).scale(1 / this.timeStep);
        }
      }
    }
  }
  