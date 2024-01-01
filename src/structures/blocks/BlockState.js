import { Vector3 } from 'three'
import { Half } from '../../tools/Constants.js'

const ANGLE_TO_VECTOR = Vector3.North

export default class BlockState {

    constructor(pos, block, meta = {}) {
        this.pos = pos
        this.id = `${pos.x}_${pos.y}_${pos.z}`
        this.block = block

        this.direction = meta.direction ?? Vector3.North
        this.rotationAxis = meta.rotationAxis ?? Vector3.Up // this is for orientation of the block (rotate to face the direction) not rotation. Rotation rotates around the direction axis 
        this.rotation = meta.rotation ?? 0
        // this.half = meta.half ?? Half.Bottom //TODO slah block block state class
        //this.inventory = new MachineInterface(meta.inventory ?? []) 

        this.cache = {}
    }

    get angle() {
        if(this.cache['angle']) return this.cache['angle']        
        let angle = this.direction.angleTo(ANGLE_TO_VECTOR)
        const cross = this.direction.clone().cross(ANGLE_TO_VECTOR)
        if(Math.max(...cross.toArray()) > 0) angle = -angle
        return this.cache['angle'] = angle
    }

    setValue(prop, value) {
        this[prop] = value
        return this
    }
}