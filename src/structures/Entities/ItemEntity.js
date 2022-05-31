
import { Sphere, Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { ChunkSize, CornerCheck, CrossCheck } from '../../tools/Constants.js';
import Chunk from '../Chunk.js';
import Stack from '../Interfaces/Stack.js';

import Entity from "./Entity.js";


export default class ItemEntity extends Entity {

    constructor(world, model, itemStack, initialVelocity = new Vector3(0, 0, 0)){
        super(world, model)
        this.velocity = initialVelocity

        this.item = itemStack.item
        this.amount = itemStack.amount

        this.checkMerge = true
        this.mergeRadius = 2
        this.main = false
    }

    get stack(){
        return new Stack(this.item, this.amount)
    }

    Update(delta){
        this.calculateVecocity(delta)
        
        if(this.isMoving){
            this.move(delta)
            this.checkChunk()
        }else{
            if(this.checkMerge) this.merge()
            this.float()
        }

    }

    float(){
        //rotate and move up and down
    }

    merge(){
        let entities = Object.values(this.chunk.entities)

        for(let dir of [...CrossCheck, ...CornerCheck]){
            let chunk = this.world.getChunkFromPos(this.position.add(dir.clone().setLength(this.mergeRadius)))
            if(Chunk.equals(chunk, this.chunk)) continue
            entities.push(...Object.values(chunk.entities))
        }
        
        const radiusSq = this.mergeRadius * this.mergeRadius
        let main = []
        entities = entities.filter(e => {
            const distance = e.position.sub(this.position).lengthSq()
            let valid = distance <= radiusSq
            if(valid && e.main && e.item.id == this.item.id){
                main.push({ distance, e })
                return false
            }
            return valid
        })
        
        if(!main.length) {
            this.main = true
        } else {
            let closest = main.sort((a, b) => a.distance - b.distance)[0].e
            for(let e of entities){
                closest.amount += e.amount
                e.despawn()
            }
            console.log(closest.amount, closest.id)
        }
        this.checkMerge = false
    }
}