import { Material } from "../../tools/Constants.js";
import Block from "../blocks/Block.js";
import AbstractRegister from "./AbstractRegister.js";

export default class Blocks extends AbstractRegister {

    constructor() {
        super()
    }


    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
        }
        return this.INSTANCE
    }

    static register(data, block) {
        if(!(block instanceof Block)) {
            console.error("Block must be an instance of Block", block)
            return this
        }
        
        block.loadData(data[block.key])
        block.id = Blocks.ID
        Blocks.new().map.set(Blocks.ID, block.key)
        Blocks.ID++

        return block
    }

    static {
        fetch('/blockData').then(r => r.json()).then(blockData => {
            this.AIR = this.register(blockData, new Block('air', Material.AIR).hasNoCollisions())
            this.DIRT = this.register(blockData, new Block('dirt', Material.SOLID))
            this.GRASS_BLOCK = this.register(blockData, new Block('grass_block', Material.SOLID))
            this.STONE = this.register(blockData, new Block('stone', Material.SOLID))
            this.COBBLESTONE = this.register(blockData, new Block('cobblestone', Material.SOLID))
            this.MOSSY_COBBLESTONE = this.register(blockData, new Block('mossy_cobblestone', Material.SOLID))
            this.GRAVEL = this.register(blockData, new Block('gravel', Material.SOLID))
            this.SAND = this.register(blockData, new Block('sand', Material.SOLID))
            this.SANDSTONE = this.register(blockData, new Block('sandstone', Material.SOLID))
            this.END_STONE = this.register(blockData, new Block('end_stone', Material.SOLID))
            this.FURNACE = this.register(blockData, new Block('furnace', Material.SOLID))
            this.GLASS = this.register(blockData, new Block('glass', Material.SOLID).isOpaque())
            this.WATER_STILL = this.register(blockData, new Block('water_still', Material.LIQUID).hasNoCollisions())
            this.STAIRS = this.register(blockData, new Block('stairs', Material.SOLID))
            this.SLAB = this.register(blockData, new Block('slab', Material.SOLID))
            this.VERTICAL_SLAB = this.register(blockData, new Block('vertical_slab', Material.SOLID))
        })
    }
}