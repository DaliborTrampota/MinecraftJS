import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three"
import TextureManager from "../../tools/TextureManager"


export default class MobBuilder {

    constructor(key) {
        this.key = key
        this.model = false

        this.loadData(window.entityData[key])
    }

    loadData(data) {
        console.log("loading entity", this.key, data)
        this.#generateModel(data.bones)
        console.log(this.model)
    }

    #generateModel(bones) {
        const model = new Group()
        model.name = this.key

        for(let b of bones) {
            const group = new Group()
            group.name = b.name

            for(let cube of b.cubes) {
                const pos = cube.origin.map((v, i) => (v + cube.size[i] / 2) / 16) // cube geometry is centered around 0 0 0 
                const size = cube.size.map(v => v / 16)
                const geometry = new BoxGeometry(size[0], size[1], size[2])
                const mesh = new Mesh(geometry, TextureManager.textures[0])

                mesh.position.set(pos[0], pos[1], pos[2])
                model.add(mesh)
            }
        }

        model.scale.set(1.5, 1.5, 1.5)
        return this.model = model
    }
}