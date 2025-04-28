// shaders/background.frag

precision mediump float;

void main() {
  // Normalized screen space [0, 1]
  vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0); // we'll fix this dynamically later

  // Manual sunset gradient
  vec3 topColor = vec3(0.1, 0.2, 0.5);   // deep blue
  vec3 midColor = vec3(1.0, 0.5, 0.0);   // orange
  vec3 botColor = vec3(1.0, 0.8, 0.6);   // light pink

  vec3 color;
  if (uv.y > 0.5) {
    float t = (uv.y - 0.5) / 0.5;
    color = mix(midColor, topColor, t);
  } else {
    float t = uv.y / 0.5;
    color = mix(botColor, midColor, t);
  }

  gl_FragColor = vec4(color, 1.0);
}
