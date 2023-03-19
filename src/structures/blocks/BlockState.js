import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0'
import { dirToSide } from "../../tools/Utils.js"

export default class BlockState {

    constructor(pos, meta) {
        this.pos = pos
        this.id = `${pos.x}_${pos.y}_${pos.z}`

        this.direction = meta?.direction ?? new Vector3(1, 0, 0)//'north'
        //this.inventory = new MachineInterface(meta.inventory ?? []) 
    }

    get side() {
        return dirToSide(this.direction)
    }

    setDirection(direction) {
        this.direction = direction
        return this
    }

    // rotate(rotateVector) {
    //     for(let axis of ['x', 'y', 'z']) {
    //         if(rotateVector[axis]) {
    //             this.direction.applyAxisAngle(new Vector3(axis == 'x', axis == 'y', axis == 'z'), rotateVector[axis])
    //         }
    //     }
    //     return this
    // }

    shouldRotateUVsFor(side, texture) {
        // console.log(side, texture)
        if(this.direction.x) return true
        if(this.direction.z && (side == 'east' || side == 'west')) return true
        return false
        //return this.direction.x && side == 'east' || this.direction.y && side == 'down' || this.direction.z && side == 'south'
        // return this.direction.x && side == 'west' || this.direction.y && side == 'up' || this.direction.z && side == 'north'
    }

    static create(context) {
        const state = new BlockState(context.hitResult.position.floor())
        if(context.block.orientable.all) {
            state.direction = context.hitResult.normal.clone()
            
            // if(context.block.variants.axis && false) {
            //     if(context.hitResult.normal.x && context.block.variants.axis.x) state.rotate(context.block.variants.axis.x)
            //     else if(context.hitResult.normal.y && context.block.variants.axis.y) state.rotate(context.block.variants.axis.y)
            //     else if(context.hitResult.normal.z && context.block.variants.axis.z) state.rotate(context.block.variants.axis.z)
            // }
        } else if(context.block.orientable.y) {
            state.direction = context.player.facingNormal.negate()
        }

        return state
    }

    static pillarUp() {
        return new BlockState(new Vector3(), { direction: new Vector3(0, 1, 0) })
    }

}