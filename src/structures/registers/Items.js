import AbstractRegister from "./AbstractRegister.js";
import Blocks from "./Blocks.js";
import Item from "../item/Item.js";
import BlockItem from "../item/BlockItem.js";

export default class Items extends AbstractRegister {

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

    static registerBlock(block, tab) {
        const blockItem = new BlockItem(block)
        blockItem.tab = tab
        return this.register(blockItem)
    }

    static register(item) {
        if(!(item instanceof Item)) {
            console.error("Item must be an instance of Item", item)
            return this
        }
        //item.setData(data)
        item.id = Items.ID
        Items.new().map.set(Items.ID, item.key)
        Items.ID++
        return item
    }

    static init() {
        this.GRASS_BLOCK = this.registerBlock(Blocks.GRASS_BLOCK, 'DEFAULT')
        this.DIRT = this.registerBlock(Blocks.DIRT, 'DEFAULT')
        this.STONE = this.registerBlock(Blocks.STONE, 'DEFAULT')
        this.COBBLESTONE = this.registerBlock(Blocks.COBBLESTONE, 'DEFAULT')
        this.MOSSY_COBBLESTONE = this.registerBlock(Blocks.MOSSY_COBBLESTONE, 'DEFAULT')
        this.GRAVEL = this.registerBlock(Blocks.GRAVEL, 'DEFAULT')
        this.SAND = this.registerBlock(Blocks.SAND, 'DEFAULT')
        this.SANDSTONE = this.registerBlock(Blocks.SANDSTONE, 'DEFAULT')
        this.END_STONE = this.registerBlock(Blocks.END_STONE, 'DEFAULT')
        this.FURNACE = this.registerBlock(Blocks.FURNACE, 'DEFAULT')
        this.GLASS = this.registerBlock(Blocks.GLASS, 'DEFAULT')
        // this.WATER_STILL = this.registerBlock(Blocks.WATER_STILL, 'DEFAULT')
        this.STAIRS = this.registerBlock(Blocks.STAIRS, 'DEFAULT')
        this.SLAB = this.registerBlock(Blocks.SLAB, 'DEFAULT')
        this.VERTICAL_SLAB = this.registerBlock(Blocks.VERTICAL_SLAB, 'DEFAULT')
        this.OAK_LOG = this.registerBlock(Blocks.OAK_LOG, 'DEFAULT')
    }

    generateIcons() {
        for(let key of this.map.values()) {
            const item = Items[key.toUpperCase()]
            if(item instanceof BlockItem) 
                item.createImage()
        }
    }
}