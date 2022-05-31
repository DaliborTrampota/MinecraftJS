import { Vector3, Vector2, Euler, Raycaster, BoxGeometry, Mesh, MeshBasicMaterial } from 'https://cdn.skypack.dev/three@0.141.0';
import Controller from './Controller.js';
import ItemEntity from '../Entities/ItemEntity.js';
import { HalfWorldSize, PI_2, GAMEMODE, BASE_PLAYER_SETTINGS, PLAYER_DIMENSIONS, RIGHT, UP, FORWARD, MATERIAL } from '../../tools/Constants.js'
import { drawBlock, clamp, moveTowards, drawPoint } from '../../tools/Utils.js'
import Inventory from './Inventory.js';
import BlockItem from '../../registers/BlockItem.js';

const WIDTH = PLAYER_DIMENSIONS.width
const Y_WIDTH = WIDTH * 0.75


export default class Player {

    constructor(model, camera, game){
        this.model = model
        this.camera = camera;
        this.game = game

        this.locked = false;
        this.viewDistance = BASE_PLAYER_SETTINGS.viewDistance
        this.sensitivity = 1
        
        this.health = BASE_PLAYER_SETTINGS.health;
        this.gamemode = GAMEMODE.CREATIVE
        this.inventory = new Inventory()

        this.velocity = new Vector3(0, 0, 0);
        this.vertVel = 0
        this.chunk = new Vector2(HalfWorldSize, HalfWorldSize)


        this.grounded = false
        this.controller = new Controller(this)
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mousedown', this.onMouseClick.bind(this));
    }

    get world() {
        return this.game.world
    }

    get chunkObj() {
        return this.game.world.chunks[this.chunk.x][this.chunk.y]
    } 

    get position() {
        return this.model.position;
    }

    set position(vector){
        this.model.position.copy(vector)
        let chunk = this.game.world.getChunkFromPos(vector)
        if(chunk) this.chunk = new Vector2(chunk.x, chunk.y)
    }

    get eyePos(){
        return this.camera.getWorldPosition(new Vector3())
    }
    

    Update(delta){
        this.calculateVelocity(delta)
        if(this.controller.jumpRequest && this.grounded) this.jump()
        this.model.translateOnAxis(this.velocity, delta)
        
        let curChunk = this.game.world.getChunkFromPos(this.position)
        if(!curChunk) return
        let curChunkPos = new Vector2(curChunk.x, curChunk.y)

        if(this.chunk.x != curChunkPos.x || this.chunk.y != curChunkPos.y){
            this.chunk = curChunkPos;
            //this.game.world.updateViewDistance()
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

    destroy(range){
        const { block, position, normal, found } = this.getAimedBlock(range)
        if(!found) return false

        let chunk = this.game.world.getChunkFromPos(position)
        let outcome = false
        if(this.gamemode == GAMEMODE.SURVIVAL){
            //TODO check if can break
            outcome = chunk.breakVoxel(position)


        }else if(this.gamemode == GAMEMODE.CREATIVE){
            outcome = chunk.removeVoxel(position, true)
        }
        return outcome
    }

    place(range){
        const { block, position, normal, found } = this.getAimedBlock(range)
        if(!found) return false

        position.sub(normal).floor()
        let playerBlockPos = this.eyePos.floor()
        
        if(playerBlockPos.equals(position) || playerBlockPos.sub(UP).equals(position))
            return false//console.log('cant place')
        

        let chunk = this.world.getChunkFromPos(position)
        return chunk.addVoxel(position, this.game.register.blocks.getID('glass'))
    }

    drop(amount = 1){
        let stack = this.inventory.slot
        if(!stack) return false

        let model = stack.item.getModel(this.eyePos.add(new Vector3(0, -0.20, 0)))
        let stackToDrop = stack.split(amount)

        /*const blockItem = new BlockItem(this.game.register.getBlock('grass_block'), 'grass_block')
        const model = blockItem.getModel()
        model.position.copy(this.eyePos.add(new Vector3(0, -0.20, 0)))
        */
        let droppedItem = new ItemEntity(this.world, model, stackToDrop, this.camera.getWorldDirection(new Vector3()).multiplyScalar(BASE_PLAYER_SETTINGS.throwSpeed))
        this.game.addUpdateSub(droppedItem)
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
        let intersects = raycaster.intersectObjects(objectsToIntersect)//this.game.scene.children

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

    get left(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(RIGHT.clone().multiplyScalar(-WIDTH))
        
        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true

        return false
    }

    get right(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(RIGHT.clone().multiplyScalar(WIDTH))

        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true

        return false
    }

    get front(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(FORWARD.clone().multiplyScalar(WIDTH))
        
        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true

        return false
    }

    get back(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(FORWARD.clone().multiplyScalar(-WIDTH))

        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.sub(UP.clone()).toArray())
        ) return true
        
        return false
    }

    
    checkDownSpeed(downSpeed) {
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.sub(UP.clone().multiplyScalar(PLAYER_DIMENSIONS.height - PLAYER_DIMENSIONS.cameraOffset))

        
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
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(UP.clone().multiplyScalar(PLAYER_DIMENSIONS.cameraOffset))
        
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
            case 1: // LMB
                this.destroy()
                break

            case 2: // Wheel click
                if(this.gamemode == GAMEMODE.CREATIVE) this.pick()
                break

            case 3: // RMB
                this.place()
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