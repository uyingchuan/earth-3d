import {Color, DirectionalLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import Stats from "stats.js"

export default class ThreeHelper {
    // 相机
    public camera: PerspectiveCamera

    // 场景
    public scene: Scene

    // 画布
    public canvas: HTMLCanvasElement

    // 画布容器
    public container: HTMLElement

    // 光栅化
    public renderer: WebGLRenderer

    // 方向光
    public directionalLight: DirectionalLight

    // 性能监控
    public stats: Stats

    constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
        this.canvas = canvas
        this.container = container

        this.stats = this.initStats()
        this.scene = this.initScene();
        this.camera = this.initCamera()
        this.renderer = this.initRenderer({canvas})
        this.directionalLight = this.initDirectionalLight()
        this.scene.add(this.directionalLight)

        this.renderer.render(this.scene, this.camera)
    }

    public changeScene(scene: Scene) {
        this.scene = scene
    }

    private initStats(): Stats {
        const stats = new Stats();
        stats.dom.style.position = 'absolute'
        stats.dom.style.bottom = '0px'
        stats.dom.style.zIndex = '100'
        this.container.appendChild(stats.dom)
        return stats;
    }

    private initScene(): Scene {
        return new Scene()
    }

    private initCamera(cameraParams = {aspect: 2, near: 0.1, far: 2000}): PerspectiveCamera {
        const {aspect, near, far} = cameraParams
        const position = new Vector3(100, 100, 600)
        const rag2Deg = 360 / (Math.PI * 2)
        const fovRad = 2 * Math.atan(this.canvas.clientHeight / 2 / position.z)
        const fovDeg = fovRad * rag2Deg
        const camera = new PerspectiveCamera(fovDeg, aspect, near, far)
        camera.position.set(position.x, position.y, position.z)
        return camera
    }

    private initRenderer(rendererParams: { canvas: HTMLCanvasElement, clearColor?: Color }): WebGLRenderer {
        const {canvas, clearColor = new Color(0xFFFFFF)} = rendererParams
        const renderer = new WebGLRenderer({canvas, antialias: true})
        renderer.setClearColor(clearColor)
        return renderer
    }

    private initDirectionalLight(color: Color = new Color(0xffffff), intensity = 1): DirectionalLight {
        const light = new DirectionalLight(color, intensity);
        light.position.set(1000, 1000, 1000)
        return light;
    }

}
