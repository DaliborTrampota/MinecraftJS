import { BoxGeometry, Mesh, Group } from 'three';
import Item from "./Item.js"
import TextureManager from '../../tools/TextureManager.js';


export default class BlockItem extends Item {

    static geometry = new BoxGeometry(0.2, 0.2, 0.2)

    constructor(block, key){
        super(key ?? block.key)
        this.block = block   
        this.image = false//`/resources/textures/blocks/${key}.png`
        this.pixelated = false
    }

    createImage() {
        this.image = window.getBlockImage(this)
    }

    getModel(position){
        let itemModel = new Group()
        itemModel.name = 'block'
        itemModel.add(new Mesh(this.block.geometry, TextureManager.textures))
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