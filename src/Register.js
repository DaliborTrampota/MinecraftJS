import { IDMap } from "./tools/Utils.js";

export default class Register {

    static blockData = false
    static itemData = false
    static lootTables = false

    constructor(){
        this.blocks = new IDMap()
        this.items = new IDMap()
        this.biomes = new Map()

        this.blockData = {}
    }

    async load(){
        if(!Register.blockData) Register.blockData = await fetch('/blockData').then(r => r.json())
        if(!Register.itemData) Register.itemData = await fetch('/itemData').then(r => r.json())
        if(!Register.lootTables) Register.lootTables = await fetch('/lootTables').then(r => r.json())
        return true
    }

    block(block){ //make block builder
        this.blocks.set(block.name, block);
        return this;
    }

    item(item){
        this.items.set(item.name, item)
        return this
    }

    biome(biome){//make biome builder
        this.biomes.set(biome.name, biome)
        return this
    }


    getBlock(blockIdOrName){
        return this.blocks.get(blockIdOrName)
        let data = Register.blockData[this.blocks.get(blockID)]
        data.id = blockID
        return data
    }

    getItem(itemIdOrName){
        return this.items.get(itemIdOrName)
    }
}