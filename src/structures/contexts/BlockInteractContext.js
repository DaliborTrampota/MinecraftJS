import { Material, UP } from "../../tools/Constants.js"
import Context from "./Context.js"


export default class BlockInteractContext extends Context {

    constructor(player, stack, hitRes){
        super(player, stack)
        this.hitResult = hitRes ?? this.getAimedBlock(this.player.range)
        this.state = hitRes.found ? this.player.chunk.getBlockState(this.hitResult.position, this.hitResult.block) : false
        this.entity = hitRes.found ? this.player.world.getEntityAt(this.hitResult.position) : false
    }

    get canInteract(){
        return true
    }

    interact(){
        if(this.entity.hasInterface)
            this.player.openInventory(this.entity)
    }

    static from(context, hitRes) {
        return new BlockInteractContext(context.player, context.player.stack, hitRes)
    }
    
}