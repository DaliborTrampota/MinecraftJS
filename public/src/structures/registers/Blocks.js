import { Material } from "../../tools/Constants.js";
import { Vector3 } from "three";
import Block from "../blocks/Block.js";
import Items from "./Items.js";
import FurnaceBlock from "../blocks/machines/FurnaceBlock.js";
import VoxelBlock from "../blocks/VoxelBlock.js";
import AbstractRegister from "./AbstractRegister.js";
import Liquid from "../blocks/liquids/Liquid.js";
import PhysicalBlock from "../blocks/PhysicalBlock.js";
import CraftingTableBlock from "../blocks/machines/CraftingTable.js";
import ResourceManager from "../../tools/ResourceManager.js";

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

    static registerLiquid(liquids) {
        for(const liq of liquids) {
            if(!(liq instanceof Liquid)) {
                console.error("Liquid must be an instance of Liquid", liq)
                return this
            }
            
            liq.id = Blocks.ID
            Blocks.new().map.set(Blocks.ID, liq.key)
            Blocks.ID++

        }

        return liquids
    }

    static init() {
        for(let name in ResourceManager.data.blocks) {
            let block = ResourceManager.data.blocks[name]
            while(block.geometry) {
                let parentBlock = ResourceManager.data.blocks[block.geometry]
                block.parent = block.geometry
                delete block.geometry
                block = Object.assign({}, parentBlock, block)
                ResourceManager.data.blocks[name] = JSON.parse(JSON.stringify(block))
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
        this.STAIRS = this.register(new VoxelBlock('stairs', Material.SOLID))
        this.SLAB = this.register(new VoxelBlock('slab', Material.SOLID))
        this.OAK_VERTICAL_SLAB = this.register(new VoxelBlock('oak_vertical_slab', Material.SOLID))
        this.OAK_LOG = this.register(new Block('oak_log', Material.SOLID))
        this.OAK_PLANKS = this.register(new Block('oak_planks', Material.SOLID))
        this.LEAVES = this.register(new Block('leaves', Material.SOLID).isTransparent(true))
        this.TABLE = this.register(new VoxelBlock('table', Material.SOLID))
        this.CHAIR = this.register(new VoxelBlock('chair', Material.SOLID))

        ;[this.WATER_STILL, this.WATER_FLOW] = this.registerLiquid(Liquid.create('water', 7, true)
            .map(l => l.hasNoCollisions().isTransparent())
        )
        ;[this.LAVA_STILL, this.LAVA_FLOW] = this.registerLiquid(Liquid.create('lava', 3, false)
            .map(l => l.hasNoCollisions().isTransparent().setFlowDirection(Vector3.Up))
        )
        
        this.CRAFTING_TABLE = this.register(new CraftingTableBlock('crafting_table', Material.SOLID))
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