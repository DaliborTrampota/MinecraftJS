import { Vector3, Vector2, MeshBasicMaterial, Mesh, BoxGeometry, Box3  } from 'three';
import { BASE_PLAYER_SETTINGS, RIGHT, UP, FORWARD } from '../../tools/Constants.js'
import { clamp, moveTowards } from '../../tools/Utils.js'

import Chunk from '../Chunk.js';
import AABB from '../../tools/AABB.js';


export default class LivingEntity {

    constructor(){
        this.model = this.createModel()

        this.health = 100

        this.velocity = new Vector3(0, 0, 0)
        this.chunkCoords = new Vector2(0, 0)
        this.vertTarget = 0

        this.grounded = false
        this.holding = {
            clickStack: [],
            RMB: false,
            LMB: false
        }

        this.maxUpStep = 0.6
    }

    get world() {
        return window.game.world
    }

    get chunk() {
        return window.game.world.chunks[Chunk.id(this.chunkCoords.x, this.chunkCoords.y)]
    } 

    get position() {
        return this.model.position
    }

    set position(vector){
        this.model.position.copy(vector)
        let chunk = window.game.world.getChunkFromPos(vector)
        if(chunk) this.chunkCoords = new Vector2(chunk.x, chunk.y)
    }
    
    get feetPos(){
        return this.position.clone().sub(new Vector3(0, this.model.h, 0))
    }

    get range(){
        return 5 //todo take in account gamemode, item in hand, etc
    }

    Update(delta){
        this.delta = delta
        this.calculateVelocity(delta)
        this.model.translateOnAxis(this.velocity, delta)
        
        let curChunk = window.game.world.getChunkFromPos(this.position)
        if(!curChunk) return
        let curChunkPos = new Vector2(curChunk.x, curChunk.y)

        if(this.chunkCoords.x != curChunkPos.x || this.chunkCoords.y != curChunkPos.y){
            this.chunkCoords = curChunkPos;
            //window.game.world.updateViewDistance()
        }
    }

    /**
     * 1. get all blocks around the player done
     * 2. generate aabbs  done
     * 3. check collisions with player's aabb done
     * 4. block velocity 
     * 5. handle steps
     * 6. push when partially inside a block
     * 
     * always generate closest aabb directly below and above the player and apply swept aabb
     * 
     */
    collide(target, delta) {
        const AABBs = this.surroundingAABBs()
        const entityBB = this.getCollisionAABB()
        
        let result = { time: 1 }
        for(let bb of AABBs) {
            let outcome = AABB.aabbSwept(entityBB, bb, target.clone().multiplyScalar(delta))
            if(outcome.time < result.time)
                result = outcome
        }
        
        if(result.time != 1) {
            const yDiff = result.bb.yMax - this.feetPos.y
            if(this.grounded && yDiff > 0 && yDiff <= this.maxUpStep) {
                this.position.y += yDiff + 0.1
                return
            //    this.grounded = true
            }

            const remainingSpeed = target.clone().multiplyScalar(1 - result.time)
            target.multiplyScalar(result.time)
            this.position = this.position.clone()//.add(result.dir.multiplyScalar(0.005))
            const bDotB = result.dir.dot(result.dir)
            const aDotB = remainingSpeed.dot(result.dir)
            if(bDotB != 0) 
                target.add(remainingSpeed.sub(result.dir.multiplyScalar(aDotB / bDotB)))

            if(result.dir.y < 0 && target.y == 0) this.grounded = true
        }
    }


    calculateVelocity(delta){
        if(!this.grounded){
            this.velocity.y += delta * this.world.gravity * 1.5
        }
        
        // const curSpeed = (this.controller.sprint ? BASE_PLAYER_SETTINGS.sprintMultiplier : 1) * BASE_PLAYER_SETTINGS.speed
        // let moveDir = new Vector3(this.controller.horizontal, 0, -this.controller.vertical).normalize().multiplyScalar(curSpeed)

        const Y = this.velocity.y
        this.velocity = moveTowards(this.velocity.clone(), moveDir.clone(), BASE_PLAYER_SETTINGS.acceleration * delta)
        this.velocity.y = clamp(Y, -80, 20)//todo implement drag

        let dir = this.model.getWorldDirection(new Vector3())
        let rot = Math.atan2(dir.x, dir.z);
        const worldDir = this.velocity.applyAxisAngle(UP, rot)
        this.grounded = false
        for(let i = 0; i < 3; i++)//fixes weird bug where the player would get stuck in a block
            this.collide(worldDir, delta)
        this.velocity.applyAxisAngle(UP, -rot)
    }

    getAABB() {
        this.model.geometry.computeBoundingBox()
        const bb = this.model.geometry.boundingBox
        const moved = bb.clone().applyMatrix4(this.model.matrixWorld)
        return AABB.fromVectors(moved.min, moved.max)//.move(this.model.getWorldPosition(new Vector3()))
    }

    getCollisionAABB() {
        return AABB.fromVectors(this.feetPos.add(new Vector3(-0.3, 0, -0.3)), this.feetPos.add(new Vector3(0.3, 1.8, 0.3)))
    }

    surroundingAABBs() {
        const AABBs = []
        const bb = this.getCollisionAABB()
        const center = bb.center()
        const RADIUS = 1
        
        for(let x = Math.floor(center.x - RADIUS - bb.width/2); x <= Math.ceil(center.x + RADIUS + bb.width/2); x++) {
            for(let z = Math.floor(center.z - RADIUS - bb.depth/2); z <= Math.ceil(center.z + RADIUS + bb.depth/2); z++) {
                for(let y = Math.floor(center.y - RADIUS - bb.height/2); y <= Math.ceil(center.y + RADIUS + bb.height/2) - 1; y++) {
                    let pos = new Vector3(x, y, z)
                    if(!this.world.checkVoxel(pos)) continue
                    const bbs = AABB.fromBlock(this.world.getVoxelFromPos(pos), pos)
                    AABBs.push(...bbs)
                }
            }
        }

        //while(!this.world.checkVoxel(feetPos.add(new Vector3(0, -1, 0)))){}
        //AABBs.push(...AABB.fromBlock(this.world.checkVoxel(feetPos), feetPos))

        return AABBs        
    }

    createModel(){
        const geometry = new BoxGeometry(0.4, 0.9, 1.8)
        const material = new MeshBasicMaterial( { color: 0x00ff00, opacity: 0.3, transparent: true } );
        const model = new Mesh( geometry, material )
        //model.geometry.translate(0, -1, 0)
        window.scene.add(model)

        model.bb = new Box3().setFromObject(model)

        model.h = geometry.parameters.height
        model.w = geometry.parameters.width
        model.d = geometry.parameters.depth
        
        return model
    }
}