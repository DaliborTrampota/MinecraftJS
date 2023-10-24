import Blocks from './Blocks.js';
import Items from './Items.js';
import Biomes from './Biomes.js';
import Recipes from './Recipes.js';

export default class RegisterManager {

    static lootTables = false

    constructor(){
        this.blocks = Blocks.new()
        this.items = Items.new()
        this.biomes = Biomes.new()

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
}