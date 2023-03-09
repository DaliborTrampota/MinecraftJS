import { clamp } from "../../tools/Utils.js"
import { BoxHelper } from 'https://cdn.skypack.dev/three@0.141.0';


export default class Controller {

    constructor(player){
        this.player = player
        this.locked = false
        this.inGUI = false

        this.movement = {
            front: false,
            back: false,
            right: false,
            left: false,
        }
        
        this.vertical = 0,
        this.horizontal = 0,

        this.jumpRequest = false,
        this.sprint = false,
        this.flying = false

        this.debug = {
            properties: Object.entries(window.game.renderer.info).map(([key, o]) => Object.keys(o).map(prop => `${key}.${prop}`)).flat(),
            active: false,
            helpers: {}
        }
        
        this.connect()
        this.createDebugPanel()
    }


    
    keyDown(e){
        switch(e.code){
            case 'KeyW': case 'ArrowUp':
                if(!this.movement.front) this.vertical++
                this.movement.front = true;
                break;

            case 'KeyS': case 'ArrowDown':
                if(!this.movement.back) this.vertical--
                this.movement.back = true;
                break;

            case 'KeyA': case 'ArrowLeft':
                if(!this.movement.left) this.horizontal--
                this.movement.left = true;
                break;

            case 'KeyD': case 'ArrowRight':
                if(!this.movement.right) this.horizontal++
                this.movement.right = true;
                break;

            case 'ShiftLeft':
                this.sprint = true;
                break;

            case 'Space':
                if(!this.flying) this.jumpRequest = true
                return

            case 'KeyP':
                this.toggleDebugPanel()
                return

            case 'KeyF':
                this.flying = !this.flying
                this.player.vertVel = 0
                break;

            case 'KeyQ':
                this.player.drop()
                return;

            case 'KeyE':
                this.player.inventory.toggle(this)
                return
        }

        if(e.code.startsWith('Digit')){
            let key = Number(e.code.slice(5))
            if(key === 0) key = 10
            this.player.inventory.slot = key - 1
            return
        }

        this.horizontal = clamp(this.horizontal, -1, 1)
        this.vertical = clamp(this.vertical, -1, 1)
    }
    
    keyUp(e){
        switch(e.code){
            case 'KeyW': case 'ArrowUp':
                if(this.movement.front) this.vertical--
                this.movement.front = false;
                break;

            case 'KeyS': case 'ArrowDown':
                if(this.movement.back) this.vertical++
                this.movement.back = false;
                break;

            case 'KeyA': case 'ArrowLeft':
                if(this.movement.left) this.horizontal++
                this.movement.left = false;
                break;

            case 'KeyD': case 'ArrowRight':
                if(this.movement.right) this.horizontal--
                this.movement.right = false;
                break;

            case 'ShiftLeft':
                this.sprint = false;
                break;
        }
        
        this.horizontal = clamp(this.horizontal, -1, 1)
        this.vertical = clamp(this.vertical, -1, 1)
    }

    onMouseScroll(e){
        this.player.inventory.slot = this.player.inventory.selectedSlot + Math.sign(e.deltaY)
    }
    
    connect(){
        document.addEventListener('wheel', this.onMouseScroll.bind(this));
        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));
        document.addEventListener('click', () => {
            if(!this.locked && !this.inGUI) document.body.requestPointerLock()
        })

        document.addEventListener('pointerlockchange', () => this.locked = !this.locked)
    }

    createDebugPanel(){
        const debug = document.getElementById('debug')

        for(let prop of this.debug.properties){
            debug.insertAdjacentHTML('beforeend', `<div id=info-${prop}></div>`)
        }
        this.debug.helpers.player = new BoxHelper(this.player.model, 0xffff00)
        window.scene.add(this.debug.helpers.player)
    }

    toggleDebugPanel(){
        this.debug.active = !this.debug.active

        const debug = document.getElementById('debug')

        if(this.debug.active){
            this.updateDebugPanel(debug)
            debug.style.display = 'block'
            this.debug.interval = setInterval(() => this.updateDebugPanel(debug), 1000)
        }else{
            debug.style.display = 'none'
            clearInterval(this.debug.interval)
        }
    }

    updateDebugPanel(debug){
        let renderer = window.game.renderer

        for(let propPath of this.debug.properties){
            let { prop, value } = this.getProp(renderer.info, propPath)
            document.getElementById(`info-${propPath}`).innerHTML = `${prop}: ${typeof value == 'number' ? value.toLocaleString() : value}`
        }
        for(let helper in this.debug.helpers) {
            this.debug.helpers[helper].update()
        } 
    }

    getProp(object, path){
        let props = path.split('.')
        let value = object[props.shift()]
        for(let prop of props){
            value = value[prop]
        }

        return { value, prop: props.at(-1) }
    }
}