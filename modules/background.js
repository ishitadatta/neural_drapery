// background.js
export async function initBackground(gl) {
  const vsSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision mediump float;
    varying vec2 vUv;
    uniform float uTime;
    uniform sampler2D uSuperman;


    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
    }

    float fbm(vec2 p) {
      float f = 0.0;
      f += 0.5 * noise(p);
      f += 0.25 * noise(p * 2.0);
      f += 0.125 * noise(p * 4.0);
      return f;
    }

    void main() {
      float t = mod(uTime * 0.1, 10.0);
      vec3 dawn = vec3(0.6, 0.4, 0.8);
      vec3 noon = vec3(0.3, 0.7, 1.0);
      vec3 dusk = vec3(1.0, 0.6, 0.3);
      vec3 night = vec3(0.05, 0.05, 0.15);

      vec3 color = mix(night, dawn, smoothstep(0.0, 2.5, t));
      color = mix(color, noon, smoothstep(2.5, 5.0, t));
      color = mix(color, dusk, smoothstep(5.0, 7.5, t));
      color = mix(color, night, smoothstep(7.5, 10.0, t));

      float clouds = fbm(vUv * 5.0 + vec2(uTime * 0.01, 0.0));
      color += 0.05 * smoothstep(0.5, 0.7, clouds);

      vec2 sunPos = vec2(0.5 + 0.4 * cos(t), 0.85);
      vec2 moonPos = vec2(0.5 - 0.4 * cos(t), 0.85);
      float sunGlow = exp(-length(vUv - sunPos) * 20.0);
      float moonGlow = exp(-length(vUv - moonPos) * 30.0);

      vec3 sunColor = vec3(1.0, 0.85, 0.4);
      vec3 moonColor = vec3(0.6, 0.7, 1.0);

      color += sunColor * sunGlow * smoothstep(2.0, 5.0, t);
      color += moonColor * moonGlow * (1.0 - smoothstep(2.0, 5.0, t));

      // Superman fly-by trigger (every 15 seconds)
      float flyTime = mod(uTime, 15.0);
      float active = step(13.0, flyTime); 
      if (active > 0.5) {
          vec2 supPos = vec2(flyTime - 13.0, 0.75); 
          vec2 uvOffset = vUv - supPos;
          vec2 texUV = uvOffset * 10.0 + vec2(0.5); 

          if (all(greaterThanEqual(texUV, vec2(0.0))) && all(lessThanEqual(texUV, vec2(1.0)))) {
              vec4 sup = texture2D(uSuperman, texUV);
              color = mix(color, sup.rgb, sup.a);
          }
      }



      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const timeUniform = gl.getUniformLocation(program, "uTime");

  return { program, buffer, timeUniform };
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
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
