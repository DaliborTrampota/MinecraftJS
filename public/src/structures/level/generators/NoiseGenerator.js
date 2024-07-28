import { WORLD_SETTINGS } from "../../../tools/Constants"
import BiomeGenerator from "./BiomeGenerator"


export default class NoiseGenerator {

    constructor(register) {
        this.register = register
        this.biomeGenerator = new BiomeGenerator(register)
    }

    getHeight(x, y) {
        return this.biomeGenerator.getHeight(x, y)
    }

    getVoxel(pos) {
        const height = Math.floor(this.biomeGenerator.getHeight(pos.x, pos.z))
        const y = Math.floor(pos.y)
        
        if(y == height) {
            const biome = this.biomeGenerator.getBiome(pos.x, pos.z)
            return this.register.getBlockID('grass_block')
        }
        else if(y < height && y > height - 3) return this.register.getBlockID('dirt')
        else if(y < height) return this.register.getBlockID('stone')
        
        // else if(y <= WORLD_SETTINGS.globalSeaLevel) return this.register.getBlockID('water_still')
        else return this.register.getBlockID('air')
    }
}