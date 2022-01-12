import { Vector3, Vector2, Euler, Raycaster } from 'https://cdn.skypack.dev/three@0.129.0';
import { HalfWorldSize, PI_2 } from './Constants.js'

export default class Player {
    constructor(camera, game){
        this.camera = camera;
        this.game = game
        this.locked = false;
        this.viewDistance = 10
        
        this.health = 100;
        this.sensitivity = 1
        this.chunk = new Vector2(HalfWorldSize, HalfWorldSize)

        this.velocity = new Vector3(0, 0, 0);
        this.rotation = new Euler(0, 0, 0, 'YXZ')

        this.movement = {
            speed: 30,
            sprintMultiplier: 10.5,
            up: false,
            down: false,
            right: false,
            left: false,
            sprint: false
        }
        
        this.Connect()
    }

    get chunkObj() {
        return this.game.world.chunks[this.chunk.x][this.chunk.y]
    } 

    get position() {
        return this.camera.position;
    }

    set position(vector){
        this.camera.position.copy(vector)
        let chunk = this.game.world.getChunkFromPos(vector)
        this.chunk = new Vector2(chunk.x, chunk.y)
    }

    Update(delta){
        this.camera.translateOnAxis(this.velocity, delta * this.movement.speed)

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

        this.rotation.setFromQuaternion(this.camera.quaternion);

        this.rotation.y -= movementX * 0.002 * this.sensitivity;
        this.rotation.x -= movementY * 0.002 * this.sensitivity;

        //Math.PI max angle == 180° and 0 min angle
        this.rotation.x = Math.max(PI_2 - Math.PI, Math.min(PI_2 - 0, this.rotation.x ) );

        this.camera.quaternion.setFromEuler( this.rotation );
    }


    calculateVelocity(){
        if(this.movement.up != this.movement.down){
            if(this.movement.up) this.velocity.z = -1 * (this.movement.sprint ? this.movement.sprintMultiplier : 1);
            else this.velocity.z = 1;
        }
            
        if(this.movement.right != this.movement.left){
            if(this.movement.right) this.velocity.x = 1;
            else this.velocity.x = -1;
        }

        if(this.movement.up == this.movement.down)
            this.velocity.z = 0;

        if(this.movement.right == this.movement.left)
            this.velocity.x = 0;
    }

    destroy(e){
        const collision = this.raycastFromCamera()
        if(!collision) return;

        if(collision.distance > 20) return console.log('Too long distance')

        let chunk = this.game.world.getChunkFromPos(collision.point)
        chunk.breakVoxel(collision.point, collision.face.normal)
        //chunk.removeVoxel(collision.point, collision.face.normal)
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
                this.movement.up = true;
                break;

            case 'KeyS': case 'ArrowDown':
                this.movement.down = true;
                break;

            case 'KeyA': case 'ArrowLeft':
                this.movement.left = true;
                break;

            case 'KeyD': case 'ArrowRight':
                this.movement.right = true;
                break;

            case 'ShiftLeft':
                this.movement.sprint = true;
                break;
        }
        this.calculateVelocity();
    }
    
    KeyUp(e){
        switch(e.code){
            case 'KeyW': case 'ArrowUp':
                this.movement.up = false;
                break;

            case 'KeyS': case 'ArrowDown':
                this.movement.down = false;
                break;

            case 'KeyA': case 'ArrowLeft':
                this.movement.left = false;
                break;

            case 'KeyD': case 'ArrowRight':
                this.movement.right = false;
                break;

            case 'ShiftLeft':
                this.movement.sprint = false;
                break;
        }
        this.calculateVelocity();
    }

    getCamera(){
        return this.camera;
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
}