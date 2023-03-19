import BlockItem from "../item/BlockItem.js";
import Item from "../item/Item.js";
import Blocks from "./Blocks.js";
import AbstractRegister from "./AbstractRegister.js";

export default class Items extends AbstractRegister {

    constructor() {
        super()
    }

    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
        }
        return this.INSTANCE
    }

    static registerBlock(data, block, tab) {
        const blockItem = new BlockItem(block)
        blockItem.tab = tab
        return this.register(data, blockItem)
    }

    static register(data, item) {
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

    static {
        fetch('/itemData').then(r => r.json()).then(data => {
            this.GRASS_BLOCK = this.registerBlock(data, Blocks.GRASS_BLOCK, 'DEFAULT')
            this.DIRT = this.registerBlock(data, Blocks.DIRT, 'DEFAULT')
            this.STONE = this.registerBlock(data, Blocks.STONE, 'DEFAULT')
            this.COBBLESTONE = this.registerBlock(data, Blocks.COBBLESTONE, 'DEFAULT')
            this.MOSSY_COBBLESTONE = this.registerBlock(data, Blocks.MOSSY_COBBLESTONE, 'DEFAULT')
            this.GRAVEL = this.registerBlock(data, Blocks.GRAVEL, 'DEFAULT')
            this.SAND = this.registerBlock(data, Blocks.SAND, 'DEFAULT')
            this.SANDSTONE = this.registerBlock(data, Blocks.SANDSTONE, 'DEFAULT')
            this.END_STONE = this.registerBlock(data, Blocks.END_STONE, 'DEFAULT')
            this.FURNACE = this.registerBlock(data, Blocks.FURNACE, 'DEFAULT')
            this.GLASS = this.registerBlock(data, Blocks.GLASS, 'DEFAULT')
            // this.WATER_STILL = this.registerBlock(Blocks.WATER_STILL, 'DEFAULT')
            this.STAIRS = this.registerBlock(data, Blocks.STAIRS, 'DEFAULT')
            this.SLAB = this.registerBlock(data, Blocks.SLAB, 'DEFAULT')
            this.VERTICAL_SLAB = this.registerBlock(data, Blocks.VERTICAL_SLAB, 'DEFAULT')
        })
    }
}