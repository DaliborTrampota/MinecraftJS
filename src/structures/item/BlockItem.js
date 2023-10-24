import { BoxGeometry, Mesh, Group } from 'https://cdn.skypack.dev/three@0.141.0';
import Item from "./Item.js"


export default class BlockItem extends Item {

    static geometry = new BoxGeometry(0.2, 0.2, 0.2)

    constructor(block, key){
        super(key ?? block.key)
        this.block = block        
        this.image
        this.pixelated = false
    }

    createImage() {
        this.image = window.getBlockImage(this)
    }

    getModel(position){
        let itemModel = new Group()
        itemModel.add(new Mesh(BlockItem.geometry, this.block.materials))
        itemModel.position.copy(position)
        return itemModel
    }

    use(blockPlaceContext){
        if(blockPlaceContext.canPlace){
            blockPlaceContext.place()
            return true
        }
        return false
    }
}