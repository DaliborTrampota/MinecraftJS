import { Vector3, Vector2 } from 'three';
import { Material, Section, WORLD_SETTINGS } from "../../tools/Constants.js"
import Context from "./Context.js"


export default class BlockPlaceContext extends Context {

    constructor(player, stack, hitRes){
        super(player, stack)
        this.hitResult = hitRes ?? this.getAimedBlock(this.player.range)

        //this.clickNormal = this.hitResult.normal
        //this.clickAngle = player.facingNormal.angleTo(player.camera.getWorldDirection(new Vector3()))
        //this.clickSection = BlockPlaceContext.getClickSection(this.hitResult.point, this.hitResult.normal)

        // if(this.hitResult.position.y < player.position.y + player.camera.position.y) 
        //     this.clickAngle = -this.clickAngle
    }

    get block() {
        return this.stack.item.block
    }

    get canPlace(){
        if(!this.hitResult.found) return false
        
        this.hitResult.position.add(this.hitResult.normal).floor()
        if(this.hitResult.position.y < 0 || this.hitResult.position.y > WORLD_SETTINGS.chunkHeight - 1) return false
        let playerBlockPos = this.player.eyePos.floor()
        
        if(this.world.getVoxelFromPos(this.hitResult.position).material != Material.AIR 
            && this.world.getVoxelFromPos(this.hitResult.position.sub(this.hitResult.normal).material != Material.AIR)
        ) {
            return false
        }
        
        if(playerBlockPos.equals(this.hitResult.position) || playerBlockPos.sub(Vector3.UpC).equals(this.hitResult.position))
            return false//console.log('cant place')
        return true
    }

    place(){
        if(!this.player.inCreative) this.stack.amount--
        this.player.setPlaceDelay()


        const blockState = this.block.getState(this)
        const chunk = this.player.world.getChunkFromPos(this.hitResult.position)

        const position = this.hitResult.position.clone()
        if(this.block.hasEntity)
            chunk.setEntityAt(position, new this.block.entityClass())
        chunk.addVoxel(position, this.block.id, blockState)

        this.player.inventory.interface.updateHotbar()
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