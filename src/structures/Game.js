import { Clock, DirectionalLight, DirectionalLightHelper, CubeTextureLoader } from 'https://cdn.skypack.dev/three@0.141.0';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/libs/stats.module.js';

import RegisterManager from './registers/RegisterManager.js';
import TextureManager from '../tools/TextureManager.js';
import BiomeGenerator from './generators/BiomeGenerator.js';
import World from './World.js';

import Player from './player/Player.js';
import Stack from './item/Stack.js';

export default class Game {

    constructor(renderer, camera){
        window.game = this

        this.renderer = renderer;
        this.camera = camera;

        this.textureManager = new TextureManager()
        this.register = new RegisterManager()

        this.player = new Player(this.camera, this);
        this.world

        this.stats = new Stats();
        document.getElementById('target').appendChild(this.stats.dom);

        this.updateSubs = [];
        this.renderer.setAnimationLoop(this.Update.bind(this));

        this.Init()
    }

    async Init(){
        this.createSkybox()
        window.scene.add(this.createLight())

        await this.textureManager.load()
        this.register.blocks.reloadTextures()
        this.register.items.generateIcons()
        
        console.log('Loaded blocks:', this.register.blocks.map.size, 'Loaded items:', this.register.items.map.size)
        
        this.world = new World(new BiomeGenerator(this.register), this.register, this.player);

        window.clock.start()
        this.addUpdateSub(this.player)
        this.addUpdateSub(this.world)
        
        for(let key of this.register.items.map.keys()) {
            // this.player.inventory.addStack(Stack.create(key, 64))
        }
        this.player.inventory.addStack(Stack.create('stairs', 64))
        this.player.inventory.addStack(Stack.create('stone', 64))
        this.player.inventory.addStack(Stack.create('vertical_slab', 64))
        this.player.inventory.addStack(Stack.create('slab', 64))

    }

    Update(){
        this.stats.update()
        for(let o of this.updateSubs){
            const delta = o.clock.getDelta();
            o.obj.Update(delta)
        }
        this.renderer.render(window.scene, this.camera);
        //console.log(this.renderer.info.render.calls)
    }

    addUpdateSub(obj){
        if('Update' in obj) this.updateSubs.push({ obj, clock: new Clock()})
        else console.warn('No Update method!', obj);
    }

    removeUpdateSub(obj){
        if('Update' in obj) {
            let idx = this.updateSubs.findIndex(o => o.obj.id == obj.id)
            if(idx === -1) return console.warn('Not subscribed to Update!')
            this.updateSubs.splice(idx, 1)
        }
        else console.warn('No Update method!', obj);
    }

    createLight(){
        const light = new DirectionalLight( 0xFFFFFF );
        light.position.set(0, 10, 0)
        const helper = new DirectionalLightHelper( light, 5 );
        return helper;
    }

    createSkybox(){
        const loader = new CubeTextureLoader();
        const texture = loader.load([
            'resources/images/skybox/right.png',
            'resources/images/skybox/left.png',
            'resources/images/skybox/top.png',
            'resources/images/skybox/bottom.png',
            'resources/images/skybox/front.png',
            'resources/images/skybox/back.png',
        ]);
        window.scene.background = texture;
    }
}