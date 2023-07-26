import { Material } from "../../tools/Constants.js";
import Block from "../blocks/Block.js";
import FurnaceBlock from "../blocks/FurnaceBlock.js";
import VoxelBlock from "../blocks/VoxelBlock.js";
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

    static register(block) {
        if(!(block instanceof Block)) {
            console.error("Block must be an instance of Block", block)
            return this
        }
        
        block.id = Blocks.ID
        Blocks.new().map.set(Blocks.ID, block.key)
        Blocks.ID++

        return block
    }

    static {
        this.AIR = this.register(new Block('air', Material.AIR).hasNoCollisions())
        this.DIRT = this.register(new Block('dirt', Material.SOLID))
        this.GRASS_BLOCK = this.register(new Block('grass_block', Material.SOLID))
        this.STONE = this.register(new Block('stone', Material.SOLID))
        this.COBBLESTONE = this.register(new Block('cobblestone', Material.SOLID))
        this.MOSSY_COBBLESTONE = this.register(new Block('mossy_cobblestone', Material.SOLID))
        this.GRAVEL = this.register(new Block('gravel', Material.SOLID))
        this.SAND = this.register(new Block('sand', Material.SOLID))
        this.SANDSTONE = this.register(new Block('sandstone', Material.SOLID))
        this.END_STONE = this.register(new Block('end_stone', Material.SOLID))
        this.FURNACE = this.register(new FurnaceBlock('furnace', Material.SOLID))
        this.GLASS = this.register(new Block('glass', Material.SOLID).isOpaque())
        this.WATER_STILL = this.register(new Block('water_still', Material.LIQUID).hasNoCollisions())
        this.STAIRS = this.register(new VoxelBlock('stairs', Material.SOLID))
        this.SLAB = this.register(new VoxelBlock('slab', Material.SOLID))
        this.VERTICAL_SLAB = this.register(new VoxelBlock('vertical_slab', Material.SOLID))
        this.OAK_LOG = this.register(new Block('oak_log', Material.SOLID))
    }

    static getByTexture(texture) {
        const blocks = []
        for(const key in this) {
            if(this[key] instanceof Block) {
                if(Object.values(this[key].rawTextures).includes(texture)) {
                    blocks.push(this[key])
                }
            }
        }
        return blocks
    }

    reloadTextures() {
        for(let key of this.map.values()) {
            Blocks[key.toUpperCase()].loadTextures()
        }
    }
}