import { Vector3, Vector2 } from 'https://cdn.skypack.dev/three@0.141.0';
import BlockState from "../blocks/BlockState.js"
import { Material, Section, UP } from "../../tools/Constants.js"
import Context from "./Context.js"


export default class BlockPlaceContext extends Context {

    constructor(player, stack, hitRes){
        super(player, stack)
        this.hitResult = hitRes ?? this.getAimedBlock(this.player.range)

        this.facingDir = player.facingNormal.negate()
        this.clickDir = this.hitResult.normal
        this.clickAngle = player.facingNormal.angleTo(player.camera.getWorldDirection(new Vector3()))
        this.clickSection = BlockPlaceContext.getClickSection(this.hitResult.point, this.hitResult.normal)
        console.log(this.clickAngle, this.clickSection)
    }

    get block() {
        return this.stack.item.block
    }

    get canPlace(){
        if(!this.hitResult.found) return false

        this.hitResult.position.add(this.hitResult.normal).floor()
        let playerBlockPos = this.player.eyePos.floor()

        if(this.world.getVoxelFromPos(this.hitResult.position).material != Material.AIR && this.world.getVoxelFromPos(this.hitResult.position.sub(this.hitResult.normal).material != Material.AIR)) {
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
        const blockState = this.block.hasEntity || this.block.isOrientable ? BlockState.fromContext(this) : undefined

        let chunk = this.player.world.getChunkFromPos(this.hitResult.position)
        chunk.addVoxel(this.hitResult.position, this.block.id, blockState)
        this.player.inventory.updateHotbar()
    }

    static SECTION_FRAME = 0.15

    static getClickSection(point3D, normal) {
        const point = new Vector2()
        if(normal.x == -1) point.set(point3D.z, point3D.y)
        if(normal.x == 1) point.set(1 - point3D.z, point3D.y)
        if(normal.y == 1) point.set(point3D.x, point3D.z)
        if(normal.y == -1) point.set(point3D.x, 1 - point3D.z)
        if(normal.z == 1) point.set(point3D.x, point3D.y)
        if(normal.z == -1) point.set(1 - point3D.x, point3D.y)
        
        if(point.x > this.SECTION_FRAME && point.x < 1 - this.SECTION_FRAME && point.y > this.SECTION_FRAME && point.y < 1 - this.SECTION_FRAME) 
            return Section.CENTER
        
        if(point.x > point.y && point.y < this.SECTION_FRAME) return Section.BOTTOM
        if(point.x > point.y && point.y > 1 - this.SECTION_FRAME) return Section.TOP
        if(point.x < point.y && point.x < this.SECTION_FRAME) return Section.LEFT
        //if(point.x < point.y && point.x > 1-FRAME) 
        return Section.RIGHT
    }
    
}