import { Vector3, Vector2, Euler, Raycaster, MeshBasicMaterial, Mesh, BoxGeometry, Box3 } from 'three';
import { PI_2, GAMEMODE, BASE_PLAYER_SETTINGS, PLAYER_DIMENSIONS, CrossCheck, CornerCheck, MOUSE_BUTTON } from '../../tools/Constants.js'
import { clamp, moveTowards } from '../../tools/Utils.js'

import ItemEntity from '../entities/ItemEntity.js';
import LivingEntity from '../entities/LivingEntity.js';

import Controller from './Controller.js';
import Inventory from '../entities/Inventory.js';
import Chunk from '../Chunk.js';
import BlockPlaceContext from '../contexts/BlockPlaceContext.js';
import BlockItem from '../item/BlockItem.js';
import Stack from '../item/Stack.js';
import AABB from '../../tools/AABB.js';
import Context from '../contexts/Context.js';
import BlockInteractContext from '../contexts/BlockInteractContext.js';

const WIDTH = PLAYER_DIMENSIONS.width
const Y_WIDTH = WIDTH * 0.75


export default class Player extends LivingEntity {

    constructor(camera){
        super()
        this.camera = camera
        this.camera.parent = this.model
        this.camera.position.set(0, -PLAYER_DIMENSIONS.cameraOffset, 0)

        this.locked = false
        this.viewDistance = BASE_PLAYER_SETTINGS.viewDistance
        this.sensitivity = 1
        
        this.health = BASE_PLAYER_SETTINGS.health;
        this.gamemode = GAMEMODE.CREATIVE
        this.inventory = new Inventory(this)
        this.controller = new Controller(this)

        this.placeDelay = 0

        this.holding = {
            clickStack: [],
            RMB: false,
            LMB: false
        }
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mousedown', this.onMouseClick.bind(this));
        document.addEventListener('mouseup', this.onMouseRelease.bind(this));

        this.maxUpStep = 0.5

        window.game.addUpdateSub(this)
    }

    get eyePos(){
        return this.camera.getWorldPosition(new Vector3())
    }
    
    get feetPos(){
        return this.position.clone().sub(new Vector3(0, 1.925, 0))
    }

    get range(){
        return this.inCreative ? 10 : 5 //TODO take in account gamemode, item in hand, etc
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
        if(this.controller.jumpRequest && this.grounded) this.jump()
        super.Update(delta)
        this.pickupEntities()

        if(this.holding.LMB || this.holding.clickStack[0] == MOUSE_BUTTON.LMB){
            this.interact(MOUSE_BUTTON.LMB)
        }else if(this.holding.RMB || this.holding.clickStack[0] == MOUSE_BUTTON.RMB){
            this.placeDelay -= delta * 1000
            this.interact(MOUSE_BUTTON.RMB)
        }
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
            const worldDir = this.velocity.applyAxisAngle(Vector3.UpC, rot)
            this.grounded = false
            for(let i = 0; i < 3; i++)//fixes weird bug where the player would get stuck in a block
                this.collide(worldDir, delta)

            this.velocity.applyAxisAngle(Vector3.UpC, -rot)
        }
    }

    jump(height){
        this.controller.jumpRequest = false
        this.grounded = false
        this.velocity.y += (height ?? BASE_PLAYER_SETTINGS.jump) * 8
    }


    openInventory(entity) {
        if(this.inventory.interface.isOpen) return console.warn("tried to open interface when inventory already open")
        this.inventory.interface.open(entity)
    }

    interact(button){
        this.holding.clickStack = []
        
        if(button == MOUSE_BUTTON.WHEEL){
            if(this.inCreative)
                this.pick() //TODO
            return
        }
//check if UsableItem
        if(button == MOUSE_BUTTON.RMB){
            const context = new Context(this, this.inventory.slot)
            const hitRes = context.getAimedBlock(this.range)
            if(!hitRes.found) return
            
            if(hitRes.block.isInteractable) {
                this.holding.RMB = false
                if(this.placeDelay > 0) return
                return hitRes.block.interact(BlockInteractContext.from(context, hitRes))
            }

            
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
        const context = new Context(this, this.inventory.slot)
        const { block, position, normal, found } = context.getAimedBlock(this.range)
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
        let stack = this.inventory.drop(amount) || Stack.create('vertical_slab', 5)
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

    getCollisionAABB() {
        return AABB.fromVectors(this.feetPos.add(new Vector3(-0.3, 0, -0.3)), this.feetPos.add(new Vector3(0.3, 1.8, 0.3)))
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

    

    createModel(){
        const geometry = new BoxGeometry(PLAYER_DIMENSIONS.width * 2, PLAYER_DIMENSIONS.height, PLAYER_DIMENSIONS.depth * 2)
        const material = new MeshBasicMaterial( { color: 0x00ff00, opacity: 0.3, transparent: true } );
        const model = new Mesh( geometry, material )
        model.geometry.translate(0, -1, 0)
        //window.scene.add(model)

        model.bb = new Box3().setFromObject(model)

        model.h = geometry.parameters.height
        model.w = geometry.parameters.width
        model.d = geometry.parameters.depth
        
        return model
    }

    
    facingNormal(ignoreY = false) {
        const dir = this.camera.getWorldDirection(new Vector3())
        if (ignoreY) dir.y = 0
        
        let axisVector = new Vector3(0, 0, 0);
    
        let maxAxis = 'x';
        let maxValue = Math.abs(dir.x);
        if (Math.abs(dir.y) > maxValue) {
            maxAxis = 'y';
            maxValue = Math.abs(dir.y);
        }
        if (Math.abs(dir.z) > maxValue) {
            maxAxis = 'z';
            maxValue = Math.abs(dir.z);
        }
    
        axisVector[maxAxis] = dir[maxAxis] > 0 ? 1 : -1;
        
        return axisVector
        // dir.normalize()
        // if(Math.abs(dir.x) > Math.abs(dir.z)) {
        //     const normal = new Vector3(1, 0, 0)
        //     return dir.x > 0 ? normal : normal.negate()
        // } else {
        //     const normal = new Vector3(0, 0, 1)
        //     return dir.z > 0 ? normal : normal.negate()
        // }
    }
}