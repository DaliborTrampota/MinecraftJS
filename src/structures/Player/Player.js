import { Vector3, Vector2, Euler, Raycaster } from 'https://cdn.skypack.dev/three@0.141.0';
import Controller from './Controller.js';
import ItemEntity from '../Entities/ItemEntity.js';
import { HalfWorldSize, PI_2, GAMEMODE, BASE_PLAYER_SETTINGS, PLAYER_DIMENSIONS, RIGHT, UP, FORWARD, MATERIAL, CrossCheck, CornerCheck, MOUSE_BUTTON } from '../../tools/Constants.js'
import { clamp, moveTowards } from '../../tools/Utils.js'

import Inventory from './Inventory.js';
import Chunk from '../Chunk.js';
import BlockPlaceContext from '../Contexts/BlockPlaceContext.js';
import BlockItem from '../../registers/BlockItem.js';

const WIDTH = PLAYER_DIMENSIONS.width
const Y_WIDTH = WIDTH * 0.75


export default class Player {

    constructor(model, camera){
        this.model = model
        this.camera = camera;

        this.locked = false;
        this.viewDistance = BASE_PLAYER_SETTINGS.viewDistance
        this.sensitivity = 1
        
        this.health = BASE_PLAYER_SETTINGS.health;
        this.gamemode = GAMEMODE.SURVIVAL
        this.inventory = new Inventory()

        this.velocity = new Vector3(0, 0, 0);
        this.vertVel = 0
        this.chunkCoords = new Vector2(HalfWorldSize, HalfWorldSize)

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
    }

    get world() {
        return window.game.world
    }

    get chunk() {
        return window.game.world.chunks[this.chunkCoords.x][this.chunkCoords.y]
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
        return this.position.clone().sub(new Vector3(0, 2, 0))
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

    calculateVelocity(delta){
        if(!this.controller.flying){
            this.velocity.y += delta * this.world.gravity * 1.5
        }else{
            this.velocity.y = 0
        }

        const curSpeed = (this.controller.sprint ? BASE_PLAYER_SETTINGS.sprintMultiplier : 1) * BASE_PLAYER_SETTINGS.speed
        let moveDir = new Vector3(this.controller.horizontal, 0, -this.controller.vertical).normalize().multiplyScalar(curSpeed)

        const Y = this.velocity.y //+ this.vertVel
        this.velocity = moveTowards(this.velocity.clone(), moveDir.clone(), BASE_PLAYER_SETTINGS.acceleration * delta)
        this.velocity.y = (this.grounded ? 0 : clamp(Y, -80, 20))

        if(!this.controller.flying){
            let dir = this.model.getWorldDirection(new Vector3())
            let rot = Math.atan2(dir.x, dir.z);
            let worldDir = this.velocity.applyAxisAngle(UP, rot)

        
            if(worldDir.z > 0 && this.back || worldDir.z < 0 && this.front)
                this.velocity.z = 0

            if(worldDir.x > 0 && this.right || worldDir.x < 0 && this.left)
                this.velocity.x = 0

            if(this.velocity.y <= 0) this.velocity.y = this.checkDownSpeed(this.velocity.y)
            else if(this.velocity.y > 0) this.velocity.y = this.checkUpSpeed(this.velocity.y)

            this.velocity.applyAxisAngle(UP, -rot)
        }
        

    }

    jump(){
        this.controller.jumpRequest = false
        this.grounded = false
        this.velocity.y += BASE_PLAYER_SETTINGS.jump * 8
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
        let stack = this.inventory.drop(amount)
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
            objectsToIntersect.push(this.world.chunks[v.x][v.y].mesh)
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

    get left(){
        let pos = this.camera.getWorldPosition(new Vector3())
        pos.addScaledVector(RIGHT, -WIDTH)
        
        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true

        return false
    }

    get right(){
        let pos = this.camera.getWorldPosition(new Vector3())
        pos.addScaledVector(RIGHT, WIDTH)

        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true

        return false
    }

    get front(){
        let pos = this.camera.getWorldPosition(new Vector3())
        pos.addScaledVector(FORWARD, WIDTH)
        
        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true

        return false
    }

    get back(){
        let pos = this.camera.getWorldPosition(new Vector3())
        pos.addScaledVector(FORWARD, -WIDTH)

        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true
        
        return false
    }

    
    checkDownSpeed(downSpeed) {
        let pos = this.camera.getWorldPosition(new Vector3())
        pos.addScaledVector(UP, -(PLAYER_DIMENSIONS.height - PLAYER_DIMENSIONS.cameraOffset))

        
        if (
            this.world.checkVoxel(pos.x - Y_WIDTH, pos.y, pos.z - Y_WIDTH) ||
            this.world.checkVoxel(pos.x + Y_WIDTH, pos.y, pos.z - Y_WIDTH) ||
            this.world.checkVoxel(pos.x + Y_WIDTH, pos.y, pos.z + Y_WIDTH) ||
            this.world.checkVoxel(pos.x - Y_WIDTH, pos.y, pos.z + Y_WIDTH)
        ) {
             this.grounded = true
             return 0;
        }
        this.grounded = false
        return downSpeed
    }

    checkUpSpeed(upSpeed) {
        let pos = this.camera.getWorldPosition(new Vector3())
        pos.addScaledVector(UP, PLAYER_DIMENSIONS.cameraOffset)
        
        if (
            this.world.checkVoxel(pos.x - Y_WIDTH, pos.y, pos.z - Y_WIDTH) ||
            this.world.checkVoxel(pos.x + Y_WIDTH, pos.y, pos.z - Y_WIDTH) ||
            this.world.checkVoxel(pos.x + Y_WIDTH, pos.y, pos.z + Y_WIDTH) ||
            this.world.checkVoxel(pos.x - Y_WIDTH, pos.y, pos.z + Y_WIDTH)
        ) return 0
    
        return upSpeed;
    }


    
    onMouseClick(e){
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