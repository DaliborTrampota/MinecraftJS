import { BoxGeometry, BufferAttribute, Group, Mesh } from "three"
import TextureManager from "../../tools/TextureManager"
import ResourceManager from "../../tools/ResourceManager"


export default class MobBuilder {

    constructor(key) {
        this.key = key
        this.aiClass = false

        this.geometries = []
        this.loadData(ResourceManager.data.entities[key])
    }

    setAI(ai) {
        this.aiClass = ai
        return this
    }

    loadData(data) {
        console.debug("loading entity", this.key)
        this.generateGeometry(data.bones)
    }

    generateGeometry(bones) {
        const modelUVs = TextureManager.textureMap.get(this.key)

        const atlas = TextureManager.textures[3]
        const w = atlas.uniforms.textureAtlas.value.image.width
        const h = atlas.uniforms.textureAtlas.value.image.height

        for(let b of bones) {
            let i = 0
            for(let cube of b.cubes) {
                const pos = cube.origin.map((v, i) => (v + cube.size[i] / 2) / 16) // cube geometry is centered around 0 0 0 
                const size = cube.size.map(v => v / 16)
                const geometry = new BoxGeometry(1, 1, 1)//size[0], size[1], size[2])
                //geometry.translate(0, size[1] / 2, 0)

                const uvs = this.#unpackUVs(
                    ...cube.size, 
                    cube.uv[0] + modelUVs[0] * w,
                    cube.uv[1] + modelUVs[1] * h, 
                    w, h).flat()
                    
                geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
                geometry.name = `${b.name}_${i}`
                this.geometries.push({ geometry, pos, size })
                i++
            }
        }
    }

    generateModel() {
        const model = new Group()
        model.name = this.key

        for(let g of this.geometries) {
            const mesh = new Mesh(g.geometry, TextureManager.textures[3])
            mesh.position.set(g.pos[0], g.pos[1], g.pos[2])
            mesh.scale.set(g.size[0], g.size[1], g.size[2])
            model.add(mesh)
        }

        return model
    }

    #unpackUVs(x, y, z, u, v, w, h) {
        return [
            //this is not flipped y
        //   this.#genFaceUVs(z + x, z, z + x + z, z + y, u, v, w, h), //east
        //   this.#genFaceUVs(0, z, z, z + y, u, v, w, h), //west
        //   this.#genFaceUVs(z, 0, z + x, z, u, v, w, h), //up
        //   this.#genFaceUVs(z + x, 0, z + x + z, z, u, v, w, h), //down
        //   this.#genFaceUVs(z, z, z + x, z + y, u, v, w, h), //north
        //   this.#genFaceUVs(z + x + z, z, z + x + z + x, z + y, u, v, w, h), //south
          
            this.#genFaceUVs(z + x, 0, z + x + z, y, u, v, w, h), //east
            this.#genFaceUVs(0, 0, z, y, u, v, w, h), //west
            this.#genFaceUVs(z, y, z + x, y + z, u, v, w, h), //up
            this.#genFaceUVs(z + x, y, z + x + x, y + z, u, v, w, h), //down
            this.#genFaceUVs(z, 0, z + x, y, u, v, w, h), //north
            this.#genFaceUVs(z + x + z, 0, z + x + z + x, y, u, v, w, h), //south
        ]
    }

    #genFaceUVs(x1, y1, x2, y2, u, v, w, h) {
        return [(x1 + u) / w, (y2 + v) / h, (x2 + u) / w, (y2 + v) / h, (x1 + u) / w, (y1 + v) / h, (x2 + u) / w, (y1 + v) / h]
    }
}