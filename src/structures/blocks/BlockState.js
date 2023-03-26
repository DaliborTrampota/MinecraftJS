import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0'
import { Half, DirectionsY, Directions } from '../../tools/Constants.js'
import { dirToSide } from "../../tools/Utils.js"

export default class BlockState {

    constructor(pos, block, meta) {
        this.pos = pos
        this.id = `${pos.x}_${pos.y}_${pos.z}`
        this.block = block

        this.entity = meta?.entity ?? null
        this.direction = meta?.direction ?? new Vector3(1, 0, 0)//'north'
        this.half = meta?.half ?? Half.Bottom
        //this.inventory = new MachineInterface(meta.inventory ?? []) 
    }

    get side() {
        return dirToSide(this.direction)
    }

    get sides() {
        let front = 'north', back = 'south'
        let right = 'east', left = 'west'
        let top = 'up', bottom = 'down'


        if(this.block.orientable.facing || this.block.orientable.rotatable) {
            if(this.side != 'north') {
                front = this.side
                back = DirectionsY[(DirectionsY[front] + 2) % 4]
    
                right = DirectionsY[(DirectionsY[front] + 1) % 4]
                left = DirectionsY[(DirectionsY[right] + 2) % 4]
            }
        }else if(this.block.orientable.side) {
            if(this.side != 'north') {
                front = this.side
                back = Directions[(Directions[front] + 3) % 6]

                right = Directions[(Directions[front] + 1) % 6]
                left = Directions[(Directions[right] + 3) % 6]

                top = Directions[(Directions[front] + 2) % 6]
                bottom = Directions[(Directions[top] + 3) % 6]
            }
        }

        if(this.block.orientable.rotatable) {

        }
  
        return {
            map: {
                north: front,
                south: back,
                east: right,
                west: left,
                up: top,
                down: bottom
            },
            rotated: { front, back, right, left, top, bottom }
        }
    }

    setValue(prop, value) {
        this[prop] = value
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

    static pillarUp() {
        return new BlockState(new Vector3(), null, { direction: new Vector3(0, 1, 0) })
    }

}