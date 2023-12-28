import { Vector3, Vector2, Euler, Raycaster } from 'three';
import { PI_2, GAMEMODE, BASE_PLAYER_SETTINGS, RIGHT, UP, FORWARD, Material, CrossCheck, CornerCheck, MOUSE_BUTTON, sides } from '../../tools/Constants.js'
import { clamp, moveTowards } from '../../tools/Utils.js'

import Chunk from '../Chunk.js';
import AABB from '../../tools/AABB.js';


export default class Entity {

    constructor(model){
        this.model = model

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

    set position(vector) {
        this.model.position.copy(vector)
        let chunk = window.game.world.getChunkFromPos(vector)
        if(chunk) this.chunkCoords = new Vector2(chunk.x, chunk.y)
    }

    Update(delta) {
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
    
    despawn(){
        this.model.removeFromParent()
        //this.model.bb.removeFromParent()
        for(let ch of this.model.children) {
            ch.geometry.dispose()
        }
        delete this.chunk.entities[this.id]
        window.game.removeUpdateSub(this)
        //todo dispose box3 somehow?
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
            const yDiff = result.bb.yMax - entityBB.yMin//this.feetPos.y
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
        

        const Y = this.velocity.y
        this.velocity = moveTowards(this.velocity.clone(), new Vector3(0, 0, 0), BASE_PLAYER_SETTINGS.acceleration * delta)
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
        const feetPos = this.feetPos.floor()
        const RADIUS = 1
        for(let x = feetPos.x - RADIUS; x <= feetPos.x + RADIUS; x++) {
            for(let z = feetPos.z - RADIUS; z <= feetPos.z + RADIUS; z++) {
                for(let y = feetPos.y + 1 + RADIUS; y >= feetPos.y - RADIUS - 1; y--) {
                    let pos = new Vector3(x, y, z)
                    if(!this.world.checkVoxelVec(pos)) continue
                    const bbs = AABB.fromBlock(this.world.getVoxelFromPos(pos), pos)
                    AABBs.push(...bbs)
                }
            }
        }

        //while(!this.world.checkVoxelVec(feetPos.add(new Vector3(0, -1, 0)))){}
        //AABBs.push(...AABB.fromBlock(this.world.checkVoxelVec(feetPos), feetPos))

        return AABBs        
    }    
}