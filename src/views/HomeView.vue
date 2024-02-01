<script setup lang="ts">
import {onMounted, ref} from "vue";
import Earth from "@/three/earth";
import {
  AmbientLight,
  AxesHelper,
  GridHelper,
  Object3D,
  PerspectiveCamera,
  Scene,
  SpotLight,
  Vector2,
  Vector3,
  WebGLRenderer
} from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const container = ref<HTMLElement>()

let scene, camera, renderer, composer, earthGroup, controls

onMounted(() => {
  const containerWidth = container.value.clientWidth
  const containerHeight = container.value.clientHeight

  // scene
  scene = new Scene()

  // camera
  camera = new PerspectiveCamera(45, containerWidth / containerHeight, 1, 1500)
  camera.position.set(-150, 100, -200)
  camera.lookAt(new Vector3(0, 0, 0))

  // renderer
  renderer = new WebGLRenderer({antialias: false, alpha: true})
  renderer.setClearColor(0xFFFFFFFF, 0)
  renderer.autoClear = false
  renderer.setSize(containerWidth, containerHeight)
  renderer.toneMappingExposure = Math.pow(1, 4.0)
  container.value.appendChild(renderer.domElement)

  // earth
  const earth = new Earth(100)
  const earthMesh = earth.bodyMesh
  earthGroup = new Object3D()
  earthGroup.add(earth.bodyMesh)
  earthGroup.add(earth.haloGroup)
  earthGroup.add(earth.particles)
  scene.add(earthGroup)

  // composer
  composer = new EffectComposer(renderer)
  composer.setSize(containerWidth, containerHeight)

  // add render pass
  const renderPass = new RenderPass(scene, camera)
  renderPass.clear = false
  composer.addPass(renderPass)

  // add unreal bloom pass
  const bloomPass = new UnrealBloomPass(
      new Vector2(containerWidth, containerHeight),
      1.5,
      -0.8,
      0.5
  )
  bloomPass.clear = false
  bloomPass.renderToScreen = true
  composer.addPass(renderPass)

  // spotlight
  const spotLight = new SpotLight(0x404040, 2.5)
  spotLight.target = earthMesh
  scene.add(spotLight)

  // ambient light
  const ambientLight = new AmbientLight(0xFFFFFF, 0.25)
  scene.add(ambientLight)

  // grid helper
  const gridHelper = new GridHelper(100, 24, 0xFF0000, 0x444444)
  gridHelper.material.opacity = 0.4
  gridHelper.rotation.x = Math.PI / 2.0

  // axes helper
  const axesHelper = new AxesHelper(100)
  scene.add(axesHelper)

  // controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.minDistance = 320
  controls.maxDistance = 320
  controls.minPolarAngle = 1
  controls.maxPolarAngle = 1.5
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 0.5
  controls.addEventListener("change", () => {
    const cameraPosition = camera.position
    spotLight.position.copy(cameraPosition)
    earth.haloGroup.lookAt(new Vector3(cameraPosition.x - 25, cameraPosition.y - 50, cameraPosition.z + 20))
  })

  // layers
  camera.layers.enable(1)
  earth.haloGroup.layers.set(1)

  render()
})

function render() {
  window.requestAnimationFrame(() => render())

  controls.update()
  earthGroup.rotation.y += 0.003

  renderer.clear()

  camera.layers.set(1)
  composer.render()

  renderer.clearDepth()

  camera.layers.set(0)
  renderer.render(scene, camera)
}
</script>

<template>
  <div ref="container" class="container"></div>
</template>

<style>
.container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #181818;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  height: 500px;
  width: 800px;
  background: #181818;
}
</style>
