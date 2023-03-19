import BlockState from "../blocks/BlockState.js"
import { Material, UP } from "../../tools/Constants.js"
import { dirToSide } from "../../tools/Utils.js"
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

        if(this.world.getVoxelFromPos(this.hitResult.position).material != Material.AIR && this.world.getVoxelFromPos(this.hitResult.position.add(this.hitResult.normal).material != Material.AIR)) {
            return false
        }
        
        if(playerBlockPos.equals(this.hitResult.position) || playerBlockPos.sub(UP).equals(this.hitResult.position))
            return false//console.log('cant place')
        return true
    }

    place(){
        if(!this.player.inCreative) this.stack.amount--
        this.player.setPlaceDelay()

        //get normal of player's facing direction

        const blockState = new BlockState(this.hitResult.position.floor(), { direction: dirToSide(this.player.facingNormal) })

        let chunk = this.player.world.getChunkFromPos(this.hitResult.position)
        chunk.addVoxel(this.hitResult.position, this.block.id, blockState)
        this.player.inventory.updateHotbar()
    }
    
}