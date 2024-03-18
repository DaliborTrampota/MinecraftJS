import { Vector3 } from 'three'
import { Half } from '../../tools/Constants.js'
import Side from '../Side.js'


export default class BlockState {

    static ANGLE_TO = Vector3.North
    static COLUMN_ANGLE_TO = Vector3.Up

    constructor(pos, block, meta = {}) {
        this.pos = pos
        this.id = `${pos.x}_${pos.y}_${pos.z}`
        this.block = block

        this.facing = meta.facing ?? Vector3.North

        //this.rotation = meta.rotation ?? 0

        //this.direction = meta.direction ?? Vector3.North
        this.rotationAxis = meta.rotationAxis ?? this.calculateRotationAxis() // this is for orientation of the block (rotate to face the direction) not rotation. Rotation rotates around the direction axis 
        // this.half = meta.half ?? Half.Bottom //TODO slah block block state class
        //this.inventory = new MachineInterface(meta.inventory ?? []) 

        this.cache = {}
    }

    get angle() {
        if(this.cache['angle']) return this.cache['angle']        

        const angleToVec = this.angleToAxis
        let angle = angleToVec.angleTo(this.facing)
        const cross = this.facing.clone().cross(angleToVec)
        if(Math.max(...cross.toArray()) > 0) angle = -angle
        console.log(angle)
        return this.cache['angle'] = angle
    }

    get angleToAxis() {
        return this.block.orientable == 'normal' ? BlockState.COLUMN_ANGLE_TO : BlockState.ANGLE_TO
    }


    setValue(prop, value) {
        this[prop] = value
        return this
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