import FurnaceEntity from "../entities/blocks/FurnaceEntity.js";
import FurnaceInterface from "../interfaces/FurnaceInterface.js";
import Block from "./Block.js";


export default class FurnaceBlock extends Block {

    constructor(key, material){
        super(key, material)

        this.entityClass = FurnaceEntity
        this.interface = new FurnaceInterface()
    }

    isInteractable() {
        return true
    }

    interact(context) {
        console.log(context, context)
        context.player.openInterface(this.interface)
    }
}