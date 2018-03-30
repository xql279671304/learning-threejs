function _classCallCheck (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

// 通过角度，半径计算x,y
function getPointS (a, r) {
  let t = Math.sqrt(Math.tan(a) * Math.tan(a) + 1)
  let y = r / t
  return {x: y * Math.tan(a), y: y}
}

function getR (x, y) {
  return Math.sqrt(x * x + y * y)
}

const SIZE = 50

class Butterfly {
  constructor (i, texture, resolution) {
    _classCallCheck(this, Butterfly)
    this.uniforms = {
      index: {
        type: 'f',
        value: i
      },
      time: {
        type: 'f',
        value: 0
      },
      size: {
        type: 'f',
        value: SIZE
      },
      texture: {
        type: 't',
        value: texture
      },
      resolution: resolution
    }
    this.physicsRenderer = null
    this.rotateObj = {
      rotate: false,
      deg: 45,
      radius: 50
    }
    this.obj = this.createObj()
  }

  createObj () {
    /* eslint-disable no-undef */
    let geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE / 2, 12, 6)
    let mesh = new THREE.Mesh(geometry, new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: 'attribute vec3 position;\nattribute vec2 uv;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float index;\nuniform float time;\nuniform float size;\n\nvarying vec3 vPosition;\nvarying vec2 vUv;\n\nvoid main() {\n  float flapTime = radians(sin(time * 6.0 - length(position.xy) / size * 2.6 + index * 2.0) * 45.0 + 30.0);\n  float hovering = cos(time * 2.0 + index * 3.0) * size / 16.0;\n  vec3 updatePosition = vec3(\n    cos(flapTime) * position.x,\n    position.y + hovering,\n    sin(flapTime) * abs(position.x) + hovering\n  );\n\n  vec4 mvPosition = modelViewMatrix * vec4(updatePosition, 1.0);\n\n  vPosition = position;\n  vUv = uv;\n\n  gl_Position = projectionMatrix * mvPosition;\n}\n',
      fragmentShader: 'precision highp float;\n\nuniform float index;\nuniform float time;\nuniform float size;\nuniform sampler2D texture;\n\nvarying vec3 vPosition;\nvarying vec2 vUv;\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\nvec3 convertHsvToRgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvoid main() {\n  vec4 texColor = texture2D(texture, vUv);\n\n  float noise = snoise3(vPosition / vec3(size * 0.25) + vec3(0.0, 0.0, time));\n  vec3 hsv = vec3(1.0 + noise * 0.2 + index * 0.7, 0.4, 1.0);\n  vec3 rgb = convertHsvToRgb(hsv);\n\n  gl_FragColor = vec4(rgb, 1.0) * texColor;\n}',
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true 
    }))
    const index = this.uniforms.index.value
    if (this.rotateObj.rotate) {
      this.rotateObj.deg += 5
    }
    if (index === 0) {
      mesh.rotation.set(0, 0, 45 * Math.PI / 180)
    } else if (index === 1) {
      mesh.rotation.set(0, 0, 315 * Math.PI / 180)
    }else if (index === 2) {
      mesh.rotation.set(0, 0, 135 * Math.PI / 180)
    }else if (index === 3) {
      mesh.rotation.set(0, 0, 225 * Math.PI / 180)
    }
    return mesh
  }
  render (renderer, time) {
    this.uniforms.time.value += time
    const resolution = this.uniforms.resolution
    const index = this.uniforms.index.value
    const centerX = Math.round(resolution.x / 6)
    const centerY = Math.round(resolution.y / 6)
    let x = this.obj.position.x
    let y = this.obj.position.y
    const speed = 1
    if (index === 0) {
      if (this.rotateObj.rotate) {
        this.rotateObj.deg += 0.5
        this.obj.rotation.z = this.obj.rotation.z + 0.5 * Math.PI / 180
        const s = getPointS(this.obj.rotation.z, getR(x, y))
        console.log(this.rotateObj.deg)
        this.obj.position.y = s.y * (this.rotateObj.deg % 360 > 90 && this.rotateObj.deg % 360 < 270 ? -1 : 1)
        this.obj.position.x = s.x * (this.rotateObj.deg % 360 > 90 && this.rotateObj.deg % 360 < 270 ? -1 : 1)
      } else {
        this.obj.position.y = y < centerY ? y + speed : 0
        this.obj.position.x = x > -centerX ? x - speed : 0
      }
    } else if (index === 1) {
      this.obj.position.y = y < centerY ? y + speed : 0
      this.obj.position.x = x < centerX ? x + speed : 0
    } else if (index === 2) {
      this.obj.position.y = y > -centerY ? y - speed : 0
      this.obj.position.x = x > -centerX ? x - speed : 0
    } else if (index === 3) {
      this.obj.position.y = y > -centerY ? y - speed : 0
      this.obj.position.x = x < centerX ? x + speed : 0
    }
    // 旋转
    if (Math.abs(this.obj.position.y) === 50 || this.rotateObj.rotate === true) {
      this.rotateObj.rotate = true
    }
  }
}

class EffectButtery {
  constructor (options) {
    this.canvas = options.canvas
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      canvas: this.canvas,
      alpha: true
    })
    this.scene = new THREE.Scene() // 场景
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10000) // 相机 正交相机
    this.clock = new THREE.Clock() // 时间跟踪
    this.loader = new THREE.TextureLoader() // 加载纹理图
    this.camera_size_x = 640
    this.camera_size_y = 480
    this.butterfly_num = 4
    this.butterflies = []
    this.resolution = options.resolution
  }
  init () {
    var self = this
    const loader = this.loader
    const num = this.butterfly_num
    const resolution = this.resolution
    let renderer = this.renderer
    let camera = this.camera
    let scene = this.scene
    let butterflies = this.butterflies
    this.resizeWindow()
    this.on()

    renderer.setClearColor(0x000000, 0)
    camera.position.set(100, 100, 1000)
    camera.lookAt(new THREE.Vector3())

    loader.crossOrigin = 'anonymous'
    loader.load('http://p1aesla3b.bkt.clouddn.com/hudie.png', function (texture) {
      texture.magFilter = THREE.NearestFilter // 限制纹理的最大
      texture.minFilter = THREE.LinearFilter // 限制纹理的最小
      for (var i = 0; i < num; i++) {
        butterflies[i] = new Butterfly(i, texture, resolution)
        butterflies[i].obj.position.set(0, 0, 0)
        scene.add(butterflies[i].obj)
      }
      self.renderLoop()
    })
  }
  resizeCamera () {
    const resolution = this.resolution
    const X = this.camera_size_x
    const Y = this.camera_size_y
    let camera = this.camera
    let x = Math.min(resolution.x / resolution.y / (X / Y), 1.0) * X
    let y = Math.min(resolution.y / resolution.x / (Y / X), 1.0) * Y
    camera.left = x * 0.5
    camera.right = x * -0.5
    camera.top = y * 0.5
    camera.bottom = y * -0.5
    camera.updateProjectionMatrix()
  }
  resizeWindow () {
    const canvas = this.canvas
    const resolution = this.resolution
    let renderer = this.renderer
    canvas.width = resolution.x
    canvas.height = resolution.y
    this.resizeCamera()
    renderer.setSize(resolution.x, resolution.y)
  }
  render () {
    const renderer = this.renderer
    const scene = this.scene
    const camera = this.camera
    const clock = this.clock
    const time = clock.getDelta()
    let butterflies = this.butterflies
    for (var i = 0; i < butterflies.length; i++) {
      butterflies[i].render(renderer, time)
    }
    renderer.render(scene, camera)
  }
  renderLoop () {
    this.render()
    requestAnimationFrame(() => this.renderLoop(this))
  }
  on () {
    window.addEventListener('resize', this.debounce(this.resizeWindow.apply(this)), 1000)
  }
  debounce (callback, duration) {
    let timer
    return function (event) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        callback(event)
      }, duration)
    }
  }
}

window.onload = function () {
  var canvas = document.getElementsByClassName('p-canvas-webgl')[0];
  var content = document.getElementsByClassName('bg')[0];
  content = content.getElementsByTagName('img')[0]
  let options = {
    canvas: canvas,
    resolution: {
      x: window.innerWidth,
      y: content.height * 0.75
    }
  }
  const bf = new EffectButtery(options)
  bf.init()
}