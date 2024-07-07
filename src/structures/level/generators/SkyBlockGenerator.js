import { Vector3 } from "three"
import { WORLD_SETTINGS } from "../../tools/Constants"
import BiomeGenerator from "./BiomeGenerator"


export default class SkyBlockGenerator {

    constructor(register) {
        this.register = register
    }

    getVoxel(pos) {
        if(pos.x == 8 && pos.z == 8 && pos.y < 30 && pos.y >= 28) return this.register.getBlockID('grass_block')
        return this.register.getBlockID('air')
    }
}