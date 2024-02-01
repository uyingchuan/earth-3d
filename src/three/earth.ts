import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    FrontSide,
    Group,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    Points,
    PointsMaterial,
    SphereGeometry,
    Spherical,
    TextureLoader,
    Vector3
} from "three";
import EarthImg from "@/assets/images/earth.jpg"
import DotImg from "@/assets/images/dot.png"

export default class Earth {
    static COLOR = 0x0689c9
    static PARTICLE_COLOR = 0xa9effc

    // 地球主体
    public readonly bodyMesh: Mesh
    // 光晕
    public readonly haloGroup: Group | Mesh
    // 发光点
    public readonly particles: Object3D

    private readonly particleDom: HTMLImageElement
    private earthImgData: ImageData

    constructor(radius: number) {
        // make earth body mesh
        const bodyGeometry = new SphereGeometry(radius, 100, 100)
        const bodyMaterial = new MeshLambertMaterial({color: Earth.COLOR})
        this.bodyMesh = new Mesh(bodyGeometry, bodyMaterial)

        // make glow particle
        this.particles = new Object3D()
        this.particleDom = document.createElement("img") as HTMLImageElement
        this.particleDom.src = EarthImg
        this.particleDom.onload = () => {
            const particleCanvas = document.createElement("canvas")
            const particleContext = particleCanvas.getContext("2d")
            particleCanvas.width = this.particleDom.width
            particleCanvas.height = this.particleDom.height
            particleContext.drawImage(this.particleDom, 0, 0, this.particleDom.width, this.particleDom.height)
            this.earthImgData = particleContext.getImageData(0, 0, this.particleDom.width, this.particleDom.height)
            this.createParticles()
        }

        // make HALO
        // const haloGeometry = new CircleGeometry(radius + 0, radius)
        // const haloMaterial1 = new MeshBasicMaterial({color: 0x0F000000, side: DoubleSide})
        // const haloMaterial2 = new MeshBasicMaterial({color: 0x0FF0FF00, side: DoubleSide})
        // const mesh1 = new Mesh(haloGeometry, haloMaterial1)
        // const mesh2 = new Mesh(haloGeometry, haloMaterial2)
        const haloGroup = new Group()
        // mesh1.layers.set(1)
        // mesh2.layers.set(1)
        // haloGroup.add(mesh1)
        // haloGroup.add(mesh2)
        this.haloGroup = haloGroup
    }

    private createParticles() {
        const positions: number[][] = [[], []]
        const sizes: number[][] = [[], []]

        const material = new PointsMaterial()
        material.size = 2.5
        material.color = new Color(Earth.PARTICLE_COLOR)
        material.map = new TextureLoader().load(DotImg)
        material.depthWrite = false
        material.transparent = true
        material.opacity = .7
        material.side = FrontSide
        material.blending = AdditiveBlending

        const spherical = new Spherical()
        spherical.radius = 100

        // 将dom按经纬划分，对比地图计算出所有陆地坐标点位
        const step = 250
        for (let i = 0; i < step; i++) {
            const vector = new Vector3()
            const radians = step * (1 - Math.sin(i / step * Math.PI)) / step + 0.5
            for (let j = 0; j < step; j += radians) {
                const s1 = j / step
                const s2 = i / step
                const index = Math.floor(2 * Math.random())
                const position = positions[index]
                const size = sizes[index]
                const isLand = Earth.isLandByUV(s1, s2, this.particleDom.width, this.particleDom.height, this.earthImgData)
                if (isLand) {
                    spherical.theta = s1 * Math.PI * 2 - Math.PI / 2
                    spherical.phi = s2 * Math.PI
                    vector.setFromSpherical(spherical)
                    position.push(vector.x)
                    position.push(vector.y)
                    position.push(vector.z)
                    if (j % 3 === 0) {
                        size.push(6.0)
                    }
                }
            }
        }

        for (let i = 0; i < 2; i++) {
            const position = positions[i]
            const size = sizes[i]
            const geometry = new BufferGeometry()
            geometry.setAttribute("position", new BufferAttribute(Float32Array.from(position), 3))
            geometry.setAttribute("size", new BufferAttribute(Float32Array.from(size), 1))
            geometry.computeBoundingSphere()
            const particle = new Points(geometry, material)
            this.particles.add(particle)
        }

    }


    /**
     * calc whether the point with s1 / s2 land by earth
     * @param s1 longitude
     * @param s2 latitude
     * @param w width
     * @param h height
     * @param imageData earth image data
     * @private
     */
    static isLandByUV(s1: number, s2: number, w: number, h: number, imageData: ImageData): boolean {
        const n = parseInt(`${w * s1}`)
        const o = parseInt(`${h * s2}`)
        return imageData.data[4 * (o * imageData.width + n)] === 0
    }
}
