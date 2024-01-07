import Block from "./Block.js"

export default class VoxelBlock extends Block {

    constructor(key, material){
        super(key, material)
    }

    getFace(side, culling = false) {
        let verts = this.vertices[side].filter(v => culling ? !v.cullface : true).map(v => v.data).flat()
        let uvs = this.UVs[side].filter(v => culling ? !v.cullface : true).map(v => v.data).flat()
        return { verts, uvs }
    }    
}