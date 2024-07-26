import { Clock, DirectionalLight, DirectionalLightHelper, CubeTextureLoader, AmbientLight } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js'

import RegisterManager from './registers/RegisterManager.js';
import TextureManager from '../tools/TextureManager.js';
import BiomeGenerator from './generators/BiomeGenerator.js';
import World from './level/World.js';

import Player from './player/Player.js';
import Stack from './item/Stack.js';
import OverworldGenerator from './level/generators/OverworldGenerator.js';
import SkyBlockGenerator from './level/generators/SkyBlockGenerator.js';
import OneChunkGenerator from './level/generators/OneChunkGenerator.js';

export default class Game {

    static #ID = 0

    constructor(renderer, camera){
        window.game = this

        this.renderer = renderer;
        this.camera = camera;

        this.textureManager = new TextureManager()
        this.register

        this.player
        this.world

        this.stats = new Stats();
        document.getElementById('target').appendChild(this.stats.dom);

        this.updateSubs = [];
        this.renderer.setAnimationLoop(this.Update.bind(this));

        this.Init()
    }

    async Init(){
        this.createSkybox()
        //this.createLight()

        await this.textureManager.load()
        this.register = new RegisterManager()
        
        this.register.blocks.generateModels()
        this.register.items.generateIcons()
        
        console.log('Loaded blocks:', this.register.blocks.map.size)
        console.log('Loaded items:', this.register.items.map.size)
        console.log('Loaded entities:', this.register.entities.map.size)
        console.log('Loaded biomes:', this.register.biomes.map.size)
        console.log('Loaded recipes:', this.register.recipes.map.size)
        
        this.player = new Player(this.camera, this)
        this.world = new World(new OverworldGenerator(this.register), this.register, this.player)
        // this.world = new World(new SkyBlockGenerator(this.register), this.register, this.player)
        // this.world = new World(new OneChunkGenerator(this.register), this.register, this.player)

        window.clock.start()
        
        for(let key of this.register.items.map.keys()) {
            // this.player.inventory.addStack(Stack.create(key, 64))
        }
        this.player.inventory.addStack(Stack.create('crafting_table', 1))
        this.player.inventory.addStack(Stack.create('furnace', 64))
        this.player.inventory.addStack(Stack.create('oak_log', 64))
        this.player.inventory.addStack(Stack.create('stone', 64))
        this.player.inventory.addStack(Stack.create('slime_spawn_egg', 64))
        this.player.inventory.addStack(Stack.create('cow_spawn_egg', 64))
        this.player.inventory.addStack(Stack.create('dispenser', 64))
        this.player.inventory.addStack(Stack.create('stairs', 64))
        this.player.inventory.addStack(Stack.create('oak_vertical_slab', 64))
        this.player.inventory.addStack(Stack.create('slab', 64))
        this.player.inventory.addStack(Stack.create('table', 64))
        this.player.inventory.addStack(Stack.create('chair', 64))
        this.player.inventory.addStack(Stack.create('grass_block', 64))
        this.player.inventory.addStack(Stack.create('sand', 64))
        this.player.inventory.addStack(Stack.create('sand', 64))
        this.player.inventory.addStack(Stack.create('sand', 64))
        this.player.inventory.addStack(Stack.create('cobblestone', 64))
        this.player.inventory.addStack(Stack.create('glass', 64))

    }

    Update(){
        this.stats.update()
        for(let o of this.updateSubs){
            const delta = o.clock.getDelta();
            o.obj.Update(delta)
        }

        let delta = window.clock.getDelta()
        for(let t of TextureManager.textures) {
            // TextureManager.animationMs += delta
            if (t.uniforms.time) {
                t.uniforms.time.value += delta
            }
            // if (t.uniforms.animFrame && TextureManager.animationMs > 100) {
            //     t.uniforms.animFrame.value++
            //     TextureManager.animationMs = 0
            // }

        }

        this.renderer.render(window.scene, this.camera);
        //console.log(this.renderer.info.render.calls)
    }

    addUpdateSub(obj){
        if('Update' in obj) {
            if(!obj.id) {
                console.warn("No ID for", obj, "which subscribed to Update, given", Game.#ID)
                obj.id = Game.#ID++
            }
            this.updateSubs.push({ obj, clock: new Clock()})
        }
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
        const light = new DirectionalLight(0xFFFFFF, 7);
        light.position.set(20, 50, 0)
        // light.castShadow = true
        window.scene.add(light)

        const ambient = new AmbientLight(0xFFFFFF, 0.2)
        //window.scene.add(ambient)

        const helper = new DirectionalLightHelper( light, 3 );
        window.scene.add(helper)
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