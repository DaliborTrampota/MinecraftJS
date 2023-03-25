import { Scene, Clock, PerspectiveCamera, WebGLRenderer } from 'https://cdn.skypack.dev/three@0.141.0';
import PhotoBooth from './tools/PhotoBooth.js';

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


async function main() {

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
    await fetchData()
    const Game = await import('./structures/Game.js').then(res => res.default)
    new Game(renderer, camera)
} 
main()


async function fetchData() {
    window.textures = await fetch('/textures').then(res => res.json())
    window.blockData = await fetch('/blockData').then(res => res.json())
    window.itemData = await fetch('/itemData').then(res => res.json())
    // window.recipeData = await fetch('/recipes').then(res => res.json())
    // let entityData = await fetch('/entities').then(res => res.json())
    // let biomeData = await fetch('/biomes').then(res => res.json())
    // let dimensionData = await fetch('/dimensions').then(res => res.json())
    // let structureData = await fetch('/structures').then(res => res.json())
    window.lootTableData = await fetch('/lootTables').then(res => res.json())
}