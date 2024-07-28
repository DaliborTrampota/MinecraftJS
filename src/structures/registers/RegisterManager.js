import Blocks from './Blocks.js';
import Items from './Items.js';
import Features from './Features.js';
import Biomes from './Biomes.js';
import Entities from './Entities.js';
import Recipes from './Recipes.js';

export default class RegisterManager {

    static lootTables = false

    constructor(){
        this.entities = Entities.new()

        this.blocks = Blocks.new()
        this.items = Items.new() // items dependant on entities and blocks
        this.features = Features.new()
        this.biomes = Biomes.new() //biomes are using features duh

        this.recipes = Recipes.new()
    }

    getBlock(blockIdOrName){
        return Blocks.get(blockIdOrName)
    }

    getBlockID(name){
        if(typeof name == "number") return name
        return Blocks.getID(name)
    }

    getBlocksByTexture(textureName) {
        return Blocks.getByTexture(textureName)
    }

    getItem(itemIdOrName){
        return Items.get(itemIdOrName)
    }

    getBiome(biomeIdOrName){
        return Biomes.get(biomeIdOrName)
    }

    getFeature(key) {
        return Features.get(key)
    }
}