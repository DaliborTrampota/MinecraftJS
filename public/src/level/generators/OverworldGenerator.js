import { WORLD_SETTINGS } from "../../tools/Constants.js"
import BiomeGenerator from "./BiomeGenerator.js"


export default class OverworldGenerator {

    constructor(register) {
        this.register = register
        this.biomeGenerator = new BiomeGenerator(register)
    }

    getBiome(x, y) {
        return this.biomeGenerator.getBiome(x, y)
    }

    getHeight(x, y) {
        return this.biomeGenerator.getHeight(x, y)
    }

    getVoxel(pos) {
        const height = Math.floor(this.biomeGenerator.getHeight(pos.x, pos.z))
        const y = Math.floor(pos.y)
        
        if(y == height) {
            const biome = this.biomeGenerator.getBiome(pos.x, pos.z)
            switch(biome.key){
                case 'forest':
                    return this.register.getBlockID('grass_block')
                case 'hills':
                    return this.register.getBlockID('stone')
                case 'desert':
                    return this.register.getBlockID('sand')
            }
            if(biome > 5) return this.register.getBlockID('sand')
            if(biome > 2) return this.register.getBlockID('gravel')
            return this.register.getBlockID('grass_block')
        }
        else if(y < height && y > height - 3) return this.register.getBlockID('dirt')
        else if(y < height) return this.register.getBlockID('stone')
        
        else if(y <= WORLD_SETTINGS.globalSeaLevel) return this.register.getBlockID('water_still')
        else return this.register.getBlockID('air')
    }
}