
import { Box3, Sphere, Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { FORWARD, RIGHT, UP, ZERO } from '../../tools/Constants.js';
import { drawBlock, drawPoint, moveTowards } from '../../tools/Utils.js';
import Chunk from '../Chunk.js';



export default class Entity {

    constructor(world, model){
        this.id = model.id

        this.world = world
        this.chunk = world.getChunkFromPos(model.position.clone())

        this.velocity = new Vector3()
        this.grounded = false

        model.bb = new Box3().setFromObject(model)
        this.model = model
        this.radius = model.bb.getBoundingSphere(new Sphere()).radius
        
        world.scene.add(this.model)
        this.chunk.entities[this.id] = this
    }

    get position(){
        return this.model.position.clone()
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
        this.velocity = moveTowards(this.velocity.clone(), new Vector3(0, 0, 0), 10 * delta)
        this.velocity.y = Y

        if(this.velocity.z > 0 && this.back || this.velocity.z < 0 && this.front)
            this.velocity.z = 0

        if(this.velocity.x > 0 && this.right || this.velocity.x < 0 && this.left)
            this.velocity.x = 0
        

        if(this.velocity.y > 0 && this.top || this.velocity.y <= 0 && this.bottom)
            this.velocity.y = 0
    }

    move(delta){
        this.model.position.add(this.velocity.clone().multiplyScalar(delta))
        this.model.bb.setFromObject(this.model)
    }

    checkChunk(){
        let chunk = this.world.getChunkFromPos(this.position)
        if(Chunk.equals(chunk, this.chunk)) return

        console.debug('Chunk change', chunk.toString(), this.chunk.toString())

        chunk.entities[this.id] = this.chunk.entities[this.id]
        delete this.chunk.entities[this.id]
        this.chunk = chunk
    }

    despawn(){
        this.model.removeFromParent()
        //this.model.bb.removeFromParent()
        this.model.geometry.dispose()
        delete this.chunk.entities[this.id]
        this.world.game.removeUpdateSub(this)
        //todo dispose box3 somehow?
    }

    get isMoving(){
        return !this.velocity.equals(ZERO)
    }

    get left(){
        let pos = this.position.clone().add(RIGHT.clone().multiplyScalar(-this.radius))
        
        if(this.world.checkVoxel(...pos.toArray())) return true

        return false
    }

    get right(){
        let pos = this.position.clone().add(RIGHT.clone().multiplyScalar(this.radius))

        if(this.world.checkVoxel(...pos.toArray())) return true

        return false
    }

    get front(){
        let pos = this.position.clone().add(FORWARD.clone().multiplyScalar(this.radius))
        
        if(this.world.checkVoxel(...pos.toArray())) return true

        return false
    }

    get back(){
        let pos = this.position.clone().add(FORWARD.clone().multiplyScalar(-this.radius))

        if(this.world.checkVoxel(...pos.toArray())) return true
        
        return false
    }

    get top(){
        let pos = this.position.clone().add(UP.clone().multiplyScalar(+this.radius))
        if(this.world.checkVoxel(...pos.toArray())) return true
        
        return false
    }

    get bottom(){
        let pos = this.position.clone().add(UP.clone().multiplyScalar(-this.radius))
        
        if(this.world.checkVoxel(...pos.toArray())) {
            this.grounded = true
            return true
        }
        this.grounded = false
        return false
    }
}