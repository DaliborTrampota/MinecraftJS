import Block from "./Block.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"

export default class VoxelBlock extends Block {

    constructor(key, material){
        super(key, material)
    }

    getFaceFor(side, state, culled) {
        const newSide = state.sides.map[side]
        const data = {
            vertices: VoxelBuilder.rotateVertices(this.vertices[newSide].filter(o => !culled ? o.type == 'unculled' : true).map(o => o.data).flat(), state.angle),
            uvs: this.UVs[newSide].filter(o => !culled ? o.type == 'unculled' : true).map(o => o.data).flat(),
        }
        return data
    }
}