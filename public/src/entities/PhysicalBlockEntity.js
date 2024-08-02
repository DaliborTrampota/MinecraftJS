import { Mesh } from "three"
import Entity from "./Entity"
import TextureManager from "../tools/TextureManager"
import LivingEntity from "./LivingEntity"
import AABB from "../tools/AABB"
import { Vector3 } from "three"

export default class PhysicalBlockEntity extends LivingEntity {

    constructor(block) {
        super(new Mesh(block.geometry, TextureManager.textures))
        this.block = block

        this.weight = block.weight
    }

    Update(delta) {
        super.Update(delta)

        if(this.grounded) {
            const chunk = this.world.getChunkFromPos(this.position)
            chunk.addVoxel(this.position, this.block.id)
            window.game.removeUpdateSub(this)
            setTimeout(() => this.model.removeFromParent(), 1000)
        }
    }

    
    getCollisionAABB() {
        return AABB.fromVectors(this.feetPos, this.feetPos.add(new Vector3(1, 1, 1)))
    }
}