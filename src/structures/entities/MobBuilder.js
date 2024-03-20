import { BoxGeometry, BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three"
import TextureManager from "../../tools/TextureManager"
import Side from "../Side"


export default class MobBuilder {

    constructor(key) {
        this.key = key
        this.model = false
        this.aiClass = false

        this.bones = false
        this.loadData(window.entityData[key])
    }

    setAI(ai) {
        this.aiClass = ai
        return this
    }

    loadData(data) {
        console.log("loading entity", this.key, data)
        this.bones = data.bones
    }

    generateModel() {
        const model = new Group()
        model.name = this.key

        let modelUVs = TextureManager.textureMap.get(this.key)
        let w = 64
        let h = 60

        for(let b of this.bones) {
            const group = new Group()
            group.name = b.name

            for(let cube of b.cubes) {
                const pos = cube.origin.map((v, i) => (v + cube.size[i] / 2) / 16) // cube geometry is centered around 0 0 0 
                const size = cube.size.map(v => v / 16)
                const geometry = new BoxGeometry(size[0], size[1], size[2])
                
                const uvs = this.#unpackUVs(
                    ...cube.size, 
                    cube.uv[0] + modelUVs[0] * w,
                    cube.uv[1] + modelUVs[1] * h, 
                    w, h).flat()
                // const w = uvs.filter((v, i) => i % 2 == 0).reduce((a, b) => Math.max(a, b))
                // const h = uvs.filter((v, i) => i % 2 == 1).reduce((a, b) => Math.max(a, b))

                //let max = Object.values(uvs).flat().reduce((a, b) => Math.max(a, b))
                geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
                
                const mesh = new Mesh(geometry, TextureManager.textures[3])

                mesh.position.set(pos[0], pos[1], pos[2])
                model.add(mesh)
            }
        }
        return this.model = model
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
            this.#genFaceUVs(z + x, y, z + x + z, y + z, u, v, w, h), //down
            this.#genFaceUVs(z, 0, z + x, y, u, v, w, h), //north
            this.#genFaceUVs(z + x + z, 0, z + x + z + x, y, u, v, w, h), //south
        ]
    }

    #genFaceUVs(x1, y1, x2, y2, u, v, w, h) {
        return [(x1 + u) / w, (y2 + v) / h, (x2 + u) / w, (y2 + v) / h, (x1 + u) / w, (y1 + v) / h, (x2 + u) / w, (y1 + v) / h]
    }
}