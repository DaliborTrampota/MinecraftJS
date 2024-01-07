
import { Vector3 } from 'three';
import { BASE_PLAYER_SETTINGS, CornerCheck, CrossCheck } from '../../tools/Constants.js';
import { moveTowards } from '../../tools/Utils.js';
import Chunk from '../Chunk.js';
import Stack from '../item/Stack.js';

import Entity from "./Entity.js";


export default class ItemEntity extends Entity {

    static MERGE_ERROR = 0.01
    static MERGE_RADIUS = 2
    static DELAY = 1000

    constructor(world, model, itemStack, initialVelocity = new Vector3(0, 0, 0)){
        super(world, model)
        this.velocity = initialVelocity

        this.item = itemStack.item
        this.amount = itemStack.amount

        this.checkMerge = true
        this.main = false
        this.accelerate = false
        this.createdAt = Date.now()

        this.lookAt(initialVelocity)
    }

    lookAt(direction){
        let target = this.position.clone().add(direction)
        this.model.children[0].lookAt(target.x, this.position.y, target.z)
    }

    get stack(){
        return new Stack(this.item, this.amount)
    }

    calculateVecocity(delta){
        if(!this.grounded) this.velocity.y += delta * this.world.gravity
        else this.velocity.y = 0

        if(this.position.y < 0) return

        const Y = this.velocity.y
        if(this.accelerate){
            let direction = this.accelerate.temp.subVectors(this.accelerate.target.clone(), this.position)
            direction.y = 0

            let vLen = this.velocity.length() + this.accelerate.speed * delta
            let lenToTarget = direction.length()

            if(lenToTarget < this.accelerate.error) {
                this.accelerationTarget()
                this.accelerate = false
            }
            
            if(vLen * delta > lenToTarget) vLen = lenToTarget //this fixes overshooting the target
            this.velocity.copy(direction).setLength(vLen)
        }else{
            this.velocity = moveTowards(this.velocity, new Vector3(0, 0, 0), 10 * delta)
        }
        this.velocity.y = Y
        
        if(this.velocity.z > 0 && this.back || this.velocity.z < 0 && this.front){
            this.velocity.x += this.velocity.x > 0 ? Math.abs(this.velocity.z) : -Math.abs(this.velocity.z)
            this.velocity.z = 0
        }

        if(this.velocity.x > 0 && this.right || this.velocity.x < 0 && this.left){
            this.velocity.z += this.velocity.z > 0 ? Math.abs(this.velocity.x) : -Math.abs(this.velocity.x)
            this.velocity.x = 0
        }
        
        if(this.velocity.y > 0 && this.top || this.velocity.y <= 0 && this.bottom)
            this.velocity.y = 0
    }

    Update(delta){
        this.calculateVecocity(delta)
        
        if(this.isMoving){
            this.move(delta)
            this.checkChunk()
            this.checkMerge = true
        }else{
            if(this.checkMerge && this.createdAt + ItemEntity.DELAY < Date.now()) this.merge()
            this.float(delta)
        }

    }

    float(delta){
        this.model.children[0].position.y += Math.sin(window.clock.getElapsedTime()) * delta * 0.05
        this.model.children[0].rotation.y += delta
    }

    merge(){
        let entities = Object.values(this.chunk.entities)

        for(let dir of [...CrossCheck, ...CornerCheck]){
            let chunk = this.world.getChunkFromPos(this.position.clone().add(dir.clone().setLength(ItemEntity.MERGE_RADIUS)))
            if(!chunk) return console.warn('entity is in no chunk', this)
            if(Chunk.equals(chunk, this.chunk)) continue
            entities.push(...Object.values(chunk.entities))
        }
        
        const radiusSq = ItemEntity.MERGE_RADIUS ** 2
        let main = []
        let filteredEntities = []
        for(let e of entities){
            if(e.item.id != this.item.id) continue
            if(Math.abs(e.position.y - this.position.y) > 0.5) continue

            const distance = e.position.clone().sub(this.position).lengthSq()
            let valid = distance <= radiusSq
            if(valid){
                if(e.main) main.push({ distance, e })
                else filteredEntities.push(e)
            }
        }
        
        if(!main.length) {
            this.main = true
        } else {
            let closest = main.sort((a, b) => a.distance - b.distance)[0].e
            for(let e of filteredEntities){
                let distToClosest = e.position.clone().sub(closest.position).lengthSq()
                if(distToClosest < ItemEntity.MERGE_ERROR) {
                    closest.amount += e.amount
                    e.despawn()
                } else if(!e.accelerate) {
                    e.accelerateTowards(closest.position, 'MERGE')
                }
            }
        }
        this.checkMerge = false
    }

    accelerateTowards(position, action, data = {}){
        this.accelerate = {
            target: position,
            action,
            speed: action == 'PICK' ? BASE_PLAYER_SETTINGS.magnetSpeed : 5,
            temp: new Vector3(),
            error: ItemEntity.getError(action),
            ...data
        }

        /*if(data.dynamic){
            this.accelerate = new Proxy(this.accelerate, {
                get(target, prop, receiver){
                    if(prop == 'target')
                        return target.dynamic.model.position
                    return Reflect.get(...arguments)
                }
            })
        }*/
        //this.lookAt(this.position.sub(position))
    }

    accelerationTarget(){
        switch(this.accelerate.action){
            case 'MERGE':
                this.merge()
                break

            case 'PICK':
                this.accelerate.player.inventory.addStack(this.stack)
                this.despawn()
                break
        }
    }

    static getError(action){
        switch(action){
            case 'MERGE':
                return ItemEntity.MERGE_ERROR
            
            case 'PICK':
                return BASE_PLAYER_SETTINGS.magnetError
        }
    }
}