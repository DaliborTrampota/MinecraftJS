import { Material } from "../../tools/Constants.js";
import Block from "../blocks/Block.js";
import Items from "./Items.js";
import FurnaceBlock from "../blocks/FurnaceBlock.js";
import VoxelBlock from "../blocks/VoxelBlock.js";
import AbstractRegister from "./AbstractRegister.js";
import WaterBlock from "../blocks/WaterBlock.js";
import PhysicalBlock from "../blocks/PhysicalBlock.js";

export default class Blocks extends AbstractRegister {

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

    static init() {
        for(let name in window.blockData) {
            let block = window.blockData[name]
            while(block.geometry) {
                let parentBlock = window.blockData[block.geometry]
                block.parent = block.geometry
                delete block.geometry
                block = Object.assign({}, parentBlock, block)
                window.blockData[name] = JSON.parse(JSON.stringify(block))
            }
        }


        this.AIR = this.register(new Block('air', Material.AIR).hasNoCollisions())
        this.DIRT = this.register(new Block('dirt', Material.SOLID))
        this.GRASS_BLOCK = this.register(new Block('grass_block', Material.SOLID))
        this.STONE = this.register(new Block('stone', Material.SOLID))
        this.COBBLESTONE = this.register(new Block('cobblestone', Material.SOLID))
        this.MOSSY_COBBLESTONE = this.register(new Block('mossy_cobblestone', Material.SOLID))
        this.GRAVEL = this.register(new PhysicalBlock('gravel', Material.SOLID).setWeight(0.8))
        this.SAND = this.register(new PhysicalBlock('sand', Material.SOLID).setWeight(0.6))
        this.SANDSTONE = this.register(new Block('sandstone', Material.SOLID))
        this.END_STONE = this.register(new Block('end_stone', Material.SOLID))
        this.FURNACE = this.register(new FurnaceBlock('furnace', Material.SOLID))
        this.DISPENSER = this.register(new FurnaceBlock('dispenser', Material.SOLID))
        this.GLASS = this.register(new Block('glass', Material.SOLID).isTransparent())
        this.WATER_STILL = this.register(new Block('water_still', Material.LIQUID).hasNoCollisions().isTransparent())
        this.STAIRS = this.register(new VoxelBlock('stairs', Material.SOLID))
        this.SLAB = this.register(new VoxelBlock('slab', Material.SOLID))
        this.OAK_VERTICAL_SLAB = this.register(new VoxelBlock('oak_vertical_slab', Material.SOLID))
        this.OAK_LOG = this.register(new Block('oak_log', Material.SOLID))
        this.LEAVES = this.register(new Block('leaves', Material.SOLID).isTransparent(true))
        this.TABLE = this.register(new VoxelBlock('table', Material.SOLID))
        this.CHAIR = this.register(new VoxelBlock('chair', Material.SOLID))
        this.WATER = this.register(new WaterBlock('water_still', Material.LIQUID).hasNoCollisions().isTransparent())
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
    
    generateModels() {
        for(let key of this.map.values()) {
            const block = Blocks[key.toUpperCase()]
            block.generateModel()
        }
    }
}