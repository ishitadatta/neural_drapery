// shaders/ground.frag

precision mediump float;

varying vec2 vUv;

float sdGround(vec2 p) {
  // Wavy ground using sine
  float wave = 0.02 * sin(10.0 * p.x) + 0.03 * sin(5.0 * p.x + 1.0);
  return p.y - (0.25 + wave);
}

void main() {
  vec2 p = vUv;

  // Distance to ground surface
  float d = sdGround(p);

  vec3 grassColor = mix(vec3(0.1, 0.5, 0.1), vec3(0.3, 0.8, 0.3), p.y * 2.0);

  if (d < 0.0) {
    // Below ground (inside grass)
    gl_FragColor = vec4(grassColor, 1.0);
  } else {
    // Above ground (transparent)
    discard;
  }
}
