import { Vector3, Vector2, Euler, Raycaster } from 'https://cdn.skypack.dev/three@0.129.0';
import { HalfWorldSize, PI_2, GAMEMODE } from './tools/Constants.js'
import { drawBlock, clamp, moveTowards } from './tools/Utils.js'

const RIGHT = new Vector3(1, 0, 0)
const UP = new Vector3(0, 1, 0)
const FORWARD = new Vector3(0, 0, -1)

export default class Player {

    constructor(model, camera, game){
        this.model = model
        this.camera = camera;
        this.game = game
        this.locked = false;
        this.viewDistance = 5
        
        this.health = 100;
        this.sensitivity = 1
        this.chunk = new Vector2(HalfWorldSize, HalfWorldSize)

        this.acceleration = 60
        this.velocity = new Vector3(0, 0, 0);
        this.grounded = false
        this.vertVel = 0

        this.gamemode = GAMEMODE.CREATIVE

        this.playerWidth = 0.3
        this.movement = {
            jump: 10,
            speed: 8,
            sprintMultiplier: 1.8,

            front: false,
            back: false,
            right: false,
            left: false,

            vertical: 0,
            horizontal: 0,

            jumpRequest: false,
            sprint: false,
            flying: false
        }
        this.Connect()
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

    get blockPosition(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos).floor()
        drawBlock(pos, this.game.scene)
        return pos
    }

    

    Update(delta){
        this.calculateVelocity(delta)
        if(this.movement.jumpRequest) this.jump(delta)
        this.model.translateOnAxis(this.velocity, delta)
        
        let curChunk = this.game.world.getChunkFromPos(this.position)
        if(!curChunk) return
        let curChunkPos = new Vector2(curChunk.x, curChunk.y)

        if(this.chunk.x != curChunkPos.x || this.chunk.y != curChunkPos.y){
            this.chunk = curChunkPos;
            //this.game.world.updateViewDistance()
        }
    }

    OnMouseMove(e){
        if(!this.locked) return;
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


    calculateVelocity(delta){
        if(!this.movement.flying){
            if (this.vertVel > this.game.gravity) 
                this.vertVel += delta * delta * this.game.gravity * 1.3
        }

        const curSpeed = (this.movement.sprint ? this.movement.sprintMultiplier : 1) * this.movement.speed
        let moveDir = new Vector3(this.movement.horizontal, 0, -this.movement.vertical).normalize().multiplyScalar(curSpeed)
        const Y = this.velocity.y + this.vertVel

        this.velocity = moveTowards(this.velocity.clone(), moveDir.clone(), this.acceleration * delta)
        this.velocity.y = (this.grounded ? 0 : clamp(Y, -80, 20))

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

    jump(delta){
        this.movement.jumpRequest = false
        this.grounded = false
        this.vertVel = this.movement.jump * delta
        console.log('jump', this.vertVel)
    }

    destroy(e){
        const collision = this.raycastFromCamera()
        if(!collision) return;

        if(collision.distance > 20) return console.log('Too long distance')

        let chunk = this.game.world.getChunkFromPos(collision.point)

        if(this.gamemode == GAMEMODE.SURVIVAL){
            //TODO check if can break
            chunk.breakVoxel(collision.point, collision.face.normal)


        }else if(this.gamemode == GAMEMODE.CREATIVE){
            chunk.removeVoxel(collision.point, collision.face.normal)
        }
    }

    place(e){
        const collision = this.raycastFromCamera()
        if(!collision) return;

        if(collision.distance > 20) return console.log('Too long distance')

        let chunk = this.game.world.getChunkFromPos(collision.point)
        chunk.addVoxel(collision.point, collision.face.normal, this.game.register.blockMap.get('end_stone'))
    }

    OnMouseClick(e){
        switch(e.which){
            case 1: // LMB
                this.destroy(e)
                break

            case 2: // Wheel click

            case 3: // RMB
                this.place(e)
                break
        }
    }

    KeyDown(e){
        switch(e.code){
            case 'KeyW': case 'ArrowUp':
                if(!this.movement.front) this.movement.vertical++
                this.movement.front = true;
                break;

            case 'KeyS': case 'ArrowDown':
                if(!this.movement.back) this.movement.vertical--
                this.movement.back = true;
                break;

            case 'KeyA': case 'ArrowLeft':
                if(!this.movement.left) this.movement.horizontal--
                this.movement.left = true;
                break;

            case 'KeyD': case 'ArrowRight':
                if(!this.movement.right) this.movement.horizontal++
                this.movement.right = true;
                break;

            case 'ShiftLeft':
                this.movement.sprint = true;
                break;

            case 'Space':
                if(this.grounded) this.movement.jumpRequest = true
                break

            case 'KeyP':
                this.debug = true
                break
        }
        this.movement.horizontal = clamp(this.movement.horizontal, -1, 1)
        this.movement.vertical = clamp(this.movement.vertical, -1, 1)
    }
    
    KeyUp(e){
        switch(e.code){
            case 'KeyW': case 'ArrowUp':
                if(this.movement.front) this.movement.vertical--
                this.movement.front = false;
                break;

            case 'KeyS': case 'ArrowDown':
                if(this.movement.back) this.movement.vertical++
                this.movement.back = false;
                break;

            case 'KeyA': case 'ArrowLeft':
                if(this.movement.left) this.movement.horizontal++
                this.movement.left = false;
                break;

            case 'KeyD': case 'ArrowRight':
                if(this.movement.right) this.movement.horizontal--
                this.movement.right = false;
                break;

            case 'ShiftLeft':
                this.movement.sprint = false;
                break;

            case 'KeyP':
                this.debug = false
                break

        }
        
        this.movement.horizontal = clamp(this.movement.horizontal, -1, 1)
        this.movement.vertical = clamp(this.movement.vertical, -1, 1)
        //this.calculateVelocity();
    }

    Connect(){
        document.addEventListener('keydown', this.KeyDown.bind(this));
        document.addEventListener('keyup', this.KeyUp.bind(this));
        document.addEventListener('mousemove', this.OnMouseMove.bind(this));
        document.addEventListener('mousedown', this.OnMouseClick.bind(this));
        document.addEventListener('click', () => {
            if(!this.locked) document.body.requestPointerLock()
        })

        document.addEventListener('pointerlockchange', () => this.locked = !this.locked)
    }

    raycastFromCamera(){
        const raycaster = new Raycaster()

        //mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        //mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        let mouse = new Vector2(0, 0)
        raycaster.setFromCamera(mouse, this.camera);
        let intersects = raycaster.intersectObjects(this.game.scene.children)

        if(intersects.length) return intersects[0]
        return false
    }


    get left(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(RIGHT.clone().multiplyScalar(-this.playerWidth))
        
        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.add(UP.clone().negate()).toArray())
        ) return true

        return false
    }

    get right(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(RIGHT.clone().multiplyScalar(this.playerWidth))

        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.add(UP.clone().negate()).toArray())
        ) return true

        return false
    }

    get front(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(FORWARD.clone().multiplyScalar(this.playerWidth))
        
        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.add(UP.clone().negate()).toArray())
        ) return true

        return false
    }

    get back(){
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(FORWARD.clone().multiplyScalar(-this.playerWidth))

        if(
            this.world.checkVoxel(...pos.toArray()) ||
            this.world.checkVoxel(...pos.add(UP.clone().negate()).toArray())
        ) return true
        
        return false
    }

    
    checkDownSpeed(downSpeed) {
        let pos = new Vector3()
        this.camera.getWorldPosition(pos)
        pos.add(new Vector3(0, -2, 0)).floor()

        if (
            this.world.checkVoxel(pos.x - this.playerWidth, pos.y, pos.z - this.playerWidth) ||
            this.world.checkVoxel(pos.x + this.playerWidth, pos.y, pos.z - this.playerWidth) ||
            this.world.checkVoxel(pos.x + this.playerWidth, pos.y, pos.z + this.playerWidth) ||
            this.world.checkVoxel(pos.x - this.playerWidth, pos.y, pos.z + this.playerWidth)
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
        if (
            this.world.checkVoxel(pos.x - this.playerWidth, pos.y - this.playerWidth, pos.z + upSpeed) ||
            this.world.checkVoxel(pos.x + this.playerWidth, pos.y - this.playerWidth, pos.z + upSpeed) ||
            this.world.checkVoxel(pos.x + this.playerWidth, pos.y + this.playerWidth, pos.z + upSpeed) ||
            this.world.checkVoxel(pos.x - this.playerWidth, pos.y + this.playerWidth, pos.z + upSpeed)
        ) return 0
    
        return upSpeed;
    }
}