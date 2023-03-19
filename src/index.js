import { Scene, Clock, PerspectiveCamera, WebGLRenderer } from 'https://cdn.skypack.dev/three@0.141.0';
import Game from './structures/Game.js'
import PhotoBooth from './tools/PhotoBooth.js';

const renderer = new WebGLRenderer();
renderer.setPixelRatio(1)
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('target').appendChild(renderer.domElement);

window.getBlockImage = PhotoBooth
window.scene = new Scene();
window.clock = new Clock();
const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 500 );

camera.near = 0.01
camera.updateProjectionMatrix()


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function preventClose(e) {
    if(window.game.player.controller.locked) {
        e.preventDefault()
        return e.returnValue = 'Are you sure you want to leave?'
    }
}

document.onresize = onWindowResize
window.onbeforeunload = preventClose


Array.prototype.view = function(start, end) {
    return new Proxy(this, {
        get(target, prop) {
            if(prop == 'view') return target.slice(start, end)
            if(prop === 'length') return end - start
            if(isNaN(prop)) return Reflect.get(...arguments)
            return target[start + Number(prop)]
        },
        set(target, prop, value) {
            if(isNaN(prop)) return Reflect.set(...arguments)
            target[start + Number(prop)] = value
            return true
        }
    })
}

Array.prototype.findIndexFrom = function(start, callback, wrap = false) {
    for(let i = start; i < this.length; i++) {
        if(callback(this[i], i, this)) return i
    }
    if(wrap) {
        for(let i = 0; i < start; i++) {
            if(callback(this[i], i, this)) return i
        }
    }
    return -1
}

new Game(renderer, camera)