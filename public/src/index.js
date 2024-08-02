import { Scene, Clock, PerspectiveCamera, WebGLRenderer } from 'three';
import './tools/Extensions.js'
import PhotoBooth from './tools/PhotoBooth.js';
import Menu from './UI/Menu.js';



window.getBlockImage = PhotoBooth
window.onbeforeunload = preventClose

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
    const target = document.getElementById("target")
    const menuTarget = document.getElementById('menu')
    const renderer = new WebGLRenderer();

    const size = { w: target.offsetWidth, h: target.offsetHeight}
    renderer.setPixelRatio(1)
    renderer.setSize(size.w, size.h)
    target.appendChild(renderer.domElement);
    
    window.maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
    window.scene = new Scene();
    window.clock = new Clock();

    const camera = new PerspectiveCamera(90, size.w / size.h, 1, 500)
    camera.near = 0.01
    camera.updateProjectionMatrix()


    window.onresize = function onWindowResize() {
        size.w = target.offsetWidth
        size.h = target.offsetHeight
        camera.aspect = size.w / size.h
        camera.updateProjectionMatrix()
        renderer.setSize(size.w, size.h)
    }
    

    const Game = await import('./Game.js').then(res => res.default)
    const game = new Game(renderer, camera)
    const menu = new Menu(menuTarget, game)
} 

window.onload = main




function preventClose(e) {
    if(window.game.player.controller.locked) {
        e.preventDefault()
        return e.returnValue = 'Are you sure you want to leave?'
    }
}
