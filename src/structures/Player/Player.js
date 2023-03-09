import { Vector3, Vector2, Euler, Raycaster } from 'https://cdn.skypack.dev/three@0.141.0';
import Controller from './Controller.js';
import ItemEntity from '../Entities/ItemEntity.js';
import { PI_2, GAMEMODE, BASE_PLAYER_SETTINGS, PLAYER_DIMENSIONS, RIGHT, UP, FORWARD, MATERIAL, CrossCheck, CornerCheck, MOUSE_BUTTON, sides } from '../../tools/Constants.js'
import { clamp, moveTowards } from '../../tools/Utils.js'

import Inventory from '../Interfaces/PlayerInventory.js';
import Chunk from '../Chunk.js';
import BlockPlaceContext from '../Contexts/BlockPlaceContext.js';
import BlockItem from '../../registers/BlockItem.js';
import Stack from '../Interfaces/Stack.js';
import AABB from '../../tools/AABB.js';

const WIDTH = PLAYER_DIMENSIONS.width
const Y_WIDTH = WIDTH * 0.75


export default class Player {

    constructor(model, camera){
        this.model = model
        this.camera = camera

        this.locked = false
        this.viewDistance = BASE_PLAYER_SETTINGS.viewDistance
        this.sensitivity = 1
        
        this.health = BASE_PLAYER_SETTINGS.health;
        this.gamemode = GAMEMODE.CREATIVE
        this.inventory = new Inventory()

        this.velocity = new Vector3(0, 0, 0)
        this.chunkCoords = new Vector2(0, 0)
        this.vertTarget = 0

        this.placeDelay = 0

        this.grounded = false
        this.controller = new Controller(this)
        this.holding = {
            clickStack: [],
            RMB: false,
            LMB: false
        }
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mousedown', this.onMouseClick.bind(this));
        document.addEventListener('mouseup', this.onMouseRelease.bind(this));

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

    get eyePos(){
        return this.camera.getWorldPosition(new Vector3())
    }
    
    get feetPos(){
        return this.position.clone().sub(new Vector3(0, 1.925, 0))
    }

    get range(){
        return this.inCreative ? 10 : 5 //todo take in account gamemode, item in hand, etc
    }

    get inCreative(){
        return this.gamemode == GAMEMODE.CREATIVE
    }

    get inSurvival(){
        return this.gamemode == GAMEMODE.SURVIVAL
    }

    setPlaceDelay(){
        this.placeDelay = BASE_PLAYER_SETTINGS.placeDelay
    }

    Update(delta){
        this.delta = delta
        this.calculateVelocity(delta)
        if(this.controller.jumpRequest && this.grounded) this.jump()
        this.model.translateOnAxis(this.velocity, delta)
        
        this.pickupEntities()
        
        let curChunk = window.game.world.getChunkFromPos(this.position)
        if(!curChunk) return
        let curChunkPos = new Vector2(curChunk.x, curChunk.y)

        if(this.chunkCoords.x != curChunkPos.x || this.chunkCoords.y != curChunkPos.y){
            this.chunkCoords = curChunkPos;
            //window.game.world.updateViewDistance()
        }

        if(this.holding.LMB || this.holding.clickStack[0] == MOUSE_BUTTON.LMB){
            this.interact(MOUSE_BUTTON.LMB)
        }else if(this.holding.RMB || this.holding.clickStack[0] == MOUSE_BUTTON.RMB){
            this.placeDelay -= delta * 1000
            this.interact(MOUSE_BUTTON.RMB)
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
        const playerBB = this.getAABB()
        
        let result = { time: 1 }
        for(let bb of AABBs) {
            let outcome = AABB.aabbSwept3D(playerBB, bb, target.clone().multiplyScalar(delta))
            if(outcome.time < result.time)
                result = outcome
        }

        if(result.time != 1) {
            const remainingSpeed = target.clone().multiplyScalar(1 - result.time)
            target.multiplyScalar(result.time)
            const bDotB = result.dir.dot(result.dir)
            const aDotB = remainingSpeed.dot(result.dir)
            if(bDotB != 0) 
                target.add(remainingSpeed.sub(result.dir.multiplyScalar(aDotB / bDotB)))
        }
        
        //this.grounded = target.y == 0
    }


    calculateVelocity(delta){
        if(!this.controller.flying && !this.grounded){
            this.velocity.y += delta * this.world.gravity * 1.5
        }else{
            this.velocity.y = this.controller.upDown * BASE_PLAYER_SETTINGS.speed
        }
        
        const curSpeed = (this.controller.sprint ? BASE_PLAYER_SETTINGS.sprintMultiplier : 1) * BASE_PLAYER_SETTINGS.speed
        let moveDir = new Vector3(this.controller.horizontal, 0, -this.controller.vertical).normalize().multiplyScalar(curSpeed)


        this.eyePos //has to be called otherwise the game freezes? figure out why TODO

        //if(!this.controller.flying){
        const Y = this.velocity.y
        this.velocity = moveTowards(this.velocity.clone(), moveDir.clone(), BASE_PLAYER_SETTINGS.acceleration * delta)
        this.velocity.y = clamp(Y, -80, 20)//todo implement drag
        //}
        if(this.gamemode != GAMEMODE.SPECTATOR){
            let dir = this.model.getWorldDirection(new Vector3())
            let rot = Math.atan2(dir.x, dir.z);
            const worldDir = this.velocity.applyAxisAngle(UP, rot)
            this.collide(worldDir, delta)//.multiplyScalar(delta))
            this.velocity.applyAxisAngle(UP, -rot)
        }
    }

    jump(height){
        this.controller.jumpRequest = false
        this.grounded = false
        this.velocity.y += (height ?? BASE_PLAYER_SETTINGS.jump) * 8
    }

    interact(button){
        this.holding.clickStack = []
        
        if(button == MOUSE_BUTTON.WHEEL){
            if(this.inCreative)
                this.pick()
            return
        }

        if(button == MOUSE_BUTTON.RMB){
            let stack = this.inventory.slot
            if(!stack) return false
            if(this.placeDelay > 0) return

            if(stack.item instanceof BlockItem){
                let blockPlaceContext = new BlockPlaceContext(this, stack)
                return stack.item.use(blockPlaceContext)
            }else{
                console.warn('action not implemented for item', stack.item)
            }
        }


        if(button == MOUSE_BUTTON.LMB){
            let stack = this.inventory.slot
            if(!stack) this.attack()

            if(this.inCreative){
                this.holding.LMB = false
                return this.destroy()
            }else{
                return this.destroy()
            }
        }
    }

    attack(){
        //console.warn('Attack not implemented')
    }

    //TODO move to use context?
    destroy(){
        const { block, position, normal, found } = this.getAimedBlock(this.range)
        if(!found) return false

        let chunk = window.game.world.getChunkFromPos(position)
        let outcome = false
        if(this.inSurvival){
            //TODO check if can break
            outcome = chunk.breakVoxel(position, 500 * this.delta)


        }else if(this.inCreative){
            outcome = chunk.removeVoxel(position)
        }
        
        return outcome
    }

    drop(amount = 1){
        let stack = this.inventory.drop(amount) || new Stack(this.world.register.getItem('vertical_slab'), 5)
        if(!stack) return false
        
        let model = stack.item.getModel(this.eyePos.add(new Vector3(0, -0.20, 0)))
        let droppedItem = new ItemEntity(this.world, model, stack, this.camera.getWorldDirection(new Vector3()).multiplyScalar(BASE_PLAYER_SETTINGS.throwSpeed))
        window.game.addUpdateSub(droppedItem)
    }

    raycastFromCamera(){
        const raycaster = new Raycaster()

        //mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        //mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        let mouse = new Vector2(0, 0)
        raycaster.setFromCamera(mouse, this.camera);

        let objectsToIntersect = []
        for(let v of this.world.activeChunks){
            objectsToIntersect.push(this.world.chunks[Chunk.id(v.x, v.y)].mesh)
        }
        let intersects = raycaster.intersectObjects(objectsToIntersect)//window.scene.children

        if(intersects.length) return intersects[0]
        return false
    }

    getAimedBlock(range = 20, options = { ignoreLiquids: true, placeOnAir: false }){
        options.ignoreLiquids ??= true
        options.placeOnAir ??= false
        
        function getBlockAt(pos, world){
            return world.getVoxelFromPos(pos.clone())
        }

        const dirLen = 0.05
        let dir = this.camera.getWorldDirection(new Vector3()).setLength(dirLen)
        
        let position = this.camera.getWorldPosition(new Vector3())
        let prevPos = new Vector3()
        let block = getBlockAt(position, this.world)
        let totalDistance = 0

        while((options.ignoreLiquids && block.material == MATERIAL.LIQUID) || block.material == MATERIAL.AIR){
            prevPos = position.clone()
            block = getBlockAt(position.add(dir), this.world)
            totalDistance += dirLen
            if(totalDistance >= range) break
        }

        if(block.material == MATERIAL.AIR && !options.placeOnAir) return { found: false }

        return { block, position, normal: position.clone().floor().sub(prevPos.floor()), found: true }
    }

    pickupEntities(){
        let entities = Object.values(this.chunk.entities)
        for(let dir of [...CrossCheck, ...CornerCheck]){
            let chunk = this.world.getChunkFromPos(this.position.clone().add(dir.clone().setLength(BASE_PLAYER_SETTINGS.magnetRadius)))
            if(Chunk.equals(chunk, this.chunk)) continue
            entities.push(...Object.values(chunk.entities))
        }

        for(let e of entities){
            if(!e || e.accelerate || e.createdAt + BASE_PLAYER_SETTINGS.pickupDelay > Date.now()) continue

            let position = this.position.clone()
            position.y = Math.floor(position.y - 1)
            if(Math.floor(e.position.y) != position.y) continue
            if(e.position.clone().sub(position).lengthSq() <= (BASE_PLAYER_SETTINGS.magnetRadius * BASE_PLAYER_SETTINGS.magnetRadius)){
                e.accelerateTowards(this.position, 'PICK', { player: this })
            }
        }
    }

    getAABB() {
        this.model.geometry.computeBoundingBox()
        const bb = this.model.geometry.boundingBox
        const moved = bb.clone().applyMatrix4(this.model.matrixWorld)
        return AABB.fromVectors(moved.min, moved.max)//.move(this.model.getWorldPosition(new Vector3()))
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
    
    onMouseClick(e){
        if(this.controller.inGUI) return
        switch(e.which){
            case MOUSE_BUTTON.LMB: 
                this.holding.clickStack.push(MOUSE_BUTTON.LMB)
                this.holding.LMB = true
                break

            case MOUSE_BUTTON.RMB:
                this.holding.clickStack.push(MOUSE_BUTTON.RMB)
                this.holding.RMB = true
                break
        }
    }

    onMouseRelease(e){
        switch(e.which){
            case MOUSE_BUTTON.LMB:
                this.holding.LMB = false
                break

            case MOUSE_BUTTON.RMB:
                this.holding.RMB = false
                this.placeDelay = 0
                break
        }
    }

    onMouseMove(e){
        if(!this.controller.locked) return;
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        let camRot = new Euler(0, 0, 0, 'YXZ')
        let modelRot =new Euler(0, 0, 0, 'YXZ')

        camRot.setFromQuaternion(this.camera.quaternion);
        modelRot.setFromQuaternion(this.model.quaternion);
        
        camRot.x -= movementY * 0.002 * this.sensitivity;
        modelRot.y -= movementX * 0.002 * this.sensitivity;

        //Math.PI max angle == 180° and 0 min angle
        camRot.x = Math.max(PI_2 - Math.PI, Math.min(PI_2 - 0, camRot.x ) );

        this.model.quaternion.setFromEuler(modelRot)
        this.camera.quaternion.setFromEuler(camRot);
    }
}