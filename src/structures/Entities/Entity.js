
import { Box3, Sphere, Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { FORWARD, RIGHT, UP, ZERO } from '../../tools/Constants.js';
import { drawBlock, drawPoint, moveTowards } from '../../tools/Utils.js';
import Chunk from '../Chunk.js';



export default class Entity {

    constructor(world, model){
        this.id = model.id

        this.world = world
        this.chunk = world.getChunkFromPos(model.position)

        this.velocity = new Vector3()
        this.grounded = false
        this.floating = false

        model.bb = new Box3().setFromObject(model)
        this.model = model
        this.radius = model.bb.getBoundingSphere(new Sphere()).radius
        
        window.scene.add(this.model)
        this.chunk.entities[this.id] = this
    }

    get position(){
        return this.model.position
    }

    get chunkPos(){
        return this.chunk.toChunkPosition(this.position) 
    }

    Update(delta){
        this.calculateVecocity(delta)
        
        if(this.isMoving){
            this.move(delta)
            this.checkChunk()
        }
    }

    calculateVecocity(delta){
        if(!this.grounded) this.velocity.y += delta * this.world.gravity
        else this.velocity.y = 0

        if(this.position.y < 0) return

        const Y = this.velocity.y
        this.velocity = moveTowards(this.velocity.clone(), this.targetVelocity, 10 * delta)
        this.velocity.y = Y

        if(this.velocity.z > 0 && this.back || this.velocity.z < 0 && this.front)
            this.velocity.z = 0

        if(this.velocity.x > 0 && this.right || this.velocity.x < 0 && this.left)
            this.velocity.x = 0
        
        if(this.velocity.y > 0 && this.top || this.velocity.y <= 0 && this.bottom)
            this.velocity.y = 0
    }

    move(delta){
        this.model.position.addScaledVector(this.velocity, delta)
        this.model.bb.setFromObject(this.model)
    }

    checkChunk(){
        let chunk = this.world.getChunkFromPos(this.position)
        if(!chunk) return console.warn('entity is in no chunk', this)
        if(Chunk.equals(chunk, this.chunk)) return

        console.debug('Chunk change', chunk.toString(), this.chunk.toString())

        chunk.entities[this.id] = this.chunk.entities[this.id]
        delete this.chunk.entities[this.id]
        this.chunk = chunk
    }

    despawn(){
        this.model.removeFromParent()
        //this.model.bb.removeFromParent()
        this.model.children[0].geometry.dispose()
        delete this.chunk.entities[this.id]
        window.game.removeUpdateSub(this)
        //todo dispose box3 somehow?
    }

    get isMoving(){
        return !this.velocity.equals(ZERO)
    }

    get left(){
        let pos = this.position.clone().addScaledVector(RIGHT, -this.radius)
        
        if(this.world.checkVoxel(...pos.toArray())) return true

        return false
    }

    get right(){
        let pos = this.position.clone().addScaledVector(RIGHT, this.radius)

        if(this.world.checkVoxel(...pos.toArray())) return true

        return false
    }

    get front(){
        let pos = this.position.clone().addScaledVector(FORWARD, this.radius)
        
        if(this.world.checkVoxel(...pos.toArray())) return true

        return false
    }

    get back(){
        let pos = this.position.clone().addScaledVector(FORWARD, -this.radius)

        if(this.world.checkVoxel(...pos.toArray())) return true
        
        return false
    }

    get top(){
        let pos = this.position.clone().addScaledVector(UP, this.radius)
        if(this.world.checkVoxel(...pos.toArray())) return true
        
        return false
    }

    get bottom(){
        let pos = this.position.clone().addScaledVector(UP, -this.radius * 1.25)
        
        if(this.world.checkVoxel(...pos.toArray())) {
            this.grounded = true
            return true
        }
        this.grounded = false
        return false
    }
}