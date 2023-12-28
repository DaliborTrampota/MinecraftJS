import Block from "./Block.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"

export default class VoxelBlock extends Block {

    constructor(key, material){
        super(key, material)
    }

    getFace(side, pos, culling = false) {
        let verts = this.vertices[side].filter(v => culling ? !v.cullface : true).map(v => v.data).flat()
        let uvs = this.UVs[side].filter(v => culling ? !v.cullface : true).map(v => v.data).flat()
        for(let i = 0; i < verts.length; i += 3) {
            verts[i    ] += pos.x
            verts[i + 1] += pos.y
            verts[i + 2] += pos.z
        }
        return { verts, uvs }
    }
}