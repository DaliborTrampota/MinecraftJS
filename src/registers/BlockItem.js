import Item from "./Item.js"
import { BoxGeometry, Mesh } from 'https://cdn.skypack.dev/three@0.141.0';


export default class BlockItem extends Item {

    static geometry = new BoxGeometry(0.2, 0.2, 0.2)

    constructor(block, name){
        super(name)
        this.block = block        
    }

    getModel(position){
        let itemModel = new Mesh(BlockItem.geometry, this.block.materials)
        itemModel.position.copy(position)
        return itemModel
    }
    
}