import { Vector3 } from "three"


export default class OneChunkGenerator {

    constructor(register) {
        this.register = register
    }

    getVoxel(pos) {
        if(pos.x >= 0 && pos.x < 16 && pos.z >= 0 && pos.z < 16 && pos.y < 64) return this.register.getBlockID('stone')
        return this.register.getBlockID('air')
    }
}