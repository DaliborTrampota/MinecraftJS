import { Vector3 } from "three"
import { WORLD_SETTINGS } from "../../tools/Constants"
import BiomeGenerator from "./BiomeGenerator"


export default class OneChunkGenerator {

    constructor(register) {
        this.register = register
    }

    getVoxel(pos) {
        if(pos.x >= 0 && pos.x < 16 && pos.z >= 0 && pos.z < 16) return this.register.getBlockID('stone')
        return this.register.getBlockID('air')
    }
}