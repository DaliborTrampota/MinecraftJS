
import CraftingTableEntity from "../../entities/blocks/CraftingTableEntity.js";
import FunctionalBlock from "../FunctionalBlock.js";


export default class CraftingTableBlock extends FunctionalBlock {

    constructor(key, material){
        super(key, material)

        this.entityClass = CraftingTableEntity
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