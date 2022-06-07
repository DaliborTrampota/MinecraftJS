import { UP } from "../../tools/Constants.js"
import Context from "./Context.js"


export default class BlockPlaceContext extends Context {

    constructor(player, stack){
        super(player)
        this.stack = stack
        this.hitResult = this.getAimedBlock(this.player.range)
    }

    get block() {
        return this.stack.item.block
    }

    get canPlace(){
        if(!this.hitResult.found) return false

        this.hitResult.position.sub(this.hitResult.normal).floor()
        let playerBlockPos = this.player.eyePos.floor()
        
        if(playerBlockPos.equals(this.hitResult.position) || playerBlockPos.sub(UP).equals(this.hitResult.position))
            return false//console.log('cant place')
        return true
    }

    place(){
        if(!this.player.inCreative) this.stack.amount--
        this.player.setPlaceDelay()

        let chunk = this.player.world.getChunkFromPos(this.hitResult.position)
        chunk.addVoxel(this.hitResult.position, this.block.id)
        this.player.inventory.updateHotbarSlot()
    }
    
}