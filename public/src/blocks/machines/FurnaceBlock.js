import FurnaceEntity from "../../entities/blocks/FurnaceEntity.js";
import FurnaceInterface from "../../interfaces/FurnaceInterface.js";
import FunctionalBlock from "../FunctionalBlock.js";


export default class FurnaceBlock extends FunctionalBlock {

    constructor(key, material){
        super(key, material)

        this.entityClass = FurnaceEntity
        //this.interfaceClass = FurnaceInterface
    }

    get isInteractable() {
        return true
    }

    interact(context) {
        if(context.canInteract){
            context.interact()
            return true
        }
        return false
    }

    onRemove() {}
}