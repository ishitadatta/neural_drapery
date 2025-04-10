// cloth.js — Defines Vec3, Particle, Spring for XPBD cloth sim

export class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    scale(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
    length() { return Math.sqrt(this.x**2 + this.y**2 + this.z**2); }
    normalize() { const l = this.length(); return this.scale(1 / (l || 1)); }
  }
  
  export class Particle {
    constructor(pos, mass = 1.0, fixed = false) {
      this.pos = pos;
      this.prevPos = pos;
      this.v = new Vec3();
      this.mass = mass;
      this.invMass = fixed ? 0 : 1 / mass;
      this.fixed = fixed;
    }
  }
  
  export class Spring {
    constructor(p1, p2, restLength, stiffness = 1.0) {
      this.p1 = p1;
      this.p2 = p2;
      this.restLength = restLength;
      this.stiffness = stiffness;
      this.lambda = 0; // XPBD Lagrange multiplier
    }
  
    solve() {
      const delta = this.p1.pos.sub(this.p2.pos);
      const dist = delta.length();
      const w1 = this.p1.invMass, w2 = this.p2.invMass;
      const C = dist - this.restLength;
  
      const grad = delta.normalize();
      const denom = w1 + w2;
      if (denom === 0) return;
  
      const s = -this.stiffness * C / denom;
      if (!this.p1.fixed) this.p1.pos = this.p1.pos.add(grad.scale(w1 * s));
      if (!this.p2.fixed) this.p2.pos = this.p2.pos.sub(grad.scale(w2 * s));
    }
  }
  