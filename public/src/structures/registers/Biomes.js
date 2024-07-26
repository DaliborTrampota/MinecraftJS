import AbstractRegister from "./AbstractRegister.js";

import OverworldBiomes from "../level/generators/OverworldBiomes.js";
import Biome from "../level/generators/Biome.js";

export default class Biomes extends AbstractRegister {

    constructor() {
        super()
    }

    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
            this.init()
        }
        return this.INSTANCE
    }

    static register(biome) {
        if(!(biome instanceof Biome)) {
            console.error("Biome must be an instance of Biome", biome)
            return this
        }
        
        biome.id = Biomes.ID
        Biomes.new().map.set(Biomes.ID, biome.key)
        Biomes.ID++

        return biome
    }

    static {
        this.FOREST = this.register(OverworldBiomes.forest())
        this.DESERT = this.register(OverworldBiomes.desert())
        this.HILLS = this.register(OverworldBiomes.hills())
        // this.PLAINS = this.register(OverworldBiomes.plains())
        // this.TAIGA = this.register(OverworldBiomes.taiga())
        // this.SNOWY = this.register(OverworldBiomes.snowy())
        // this.SWAMP = this.register(OverworldBiomes.swamp())
        // this.JUNGLE = this.register(OverworldBiomes.jungle())
        // this.BADLANDS = this.register(OverworldBiomes.badlands())
    }
}