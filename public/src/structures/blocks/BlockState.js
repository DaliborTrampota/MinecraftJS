import { Vector3 } from 'three'
import { Half } from '../../tools/Constants.js'
import Side from '../Side.js'
import { angleToAxis } from '../../tools/Utils.js'


export default class BlockState {

    static ANGLE_TO = Vector3.North
    static COLUMN_ANGLE_TO = Vector3.Up

    constructor(pos, block, meta = {}, store = {}) {
        this.pos = pos
        this.id = `${pos.x}_${pos.y}_${pos.z}`
        this.block = block

        this.facing = meta.facing ?? Vector3.North
        //this.half = meta.half ?? Half.Bottom //TODO slah block block state class
        //this.rotation = meta.rotation ?? 0 // only if facing up or down

        this.rotationAxis = meta.rotationAxis ?? this.calculateRotationAxis() // this is for orientation of the block (rotate to face the direction) not rotation. Rotation rotates around the direction axis 
        //this.inventory = new MachineInterface(meta.inventory ?? []) 

        this.store = store
    }

    get angle() {
        if(this.store['angle']) return this.store['angle']        

        return this.store['angle'] = angleToAxis(this.angleToAxis, this.facing)
    }

    get angleToAxis() {
        return this.block.orientable == 'normal' ? BlockState.COLUMN_ANGLE_TO : BlockState.ANGLE_TO
    }


    set(prop, value) {
        this.store[prop] = value
        return this
    }

    get(prop) {
        return this.store[prop]
    }

    rotated(side) {
        return Side.rotate(side, -this.angle, this.rotationAxis) // negative angle because we want to get the side that would be rotated to the current side
    }

    calculateRotationAxis() {
        let axis = new Vector3().crossVectors(this.angleToAxis, this.facing)
        if (axis.lengthSq() == 0) {
            axis = Vector3.Up
        } else {
            axis.x = Math.abs(axis.x);
            axis.y = Math.abs(axis.y);
            axis.z = Math.abs(axis.z);
        }
        return axis
    }
}