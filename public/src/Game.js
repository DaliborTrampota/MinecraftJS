import { Clock, DirectionalLight, DirectionalLightHelper, CubeTextureLoader, AmbientLight, Color } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js'

import RegisterManager from './registers/RegisterManager.js';
import TextureManager from './tools/TextureManager.js';
import ResourceManager from './tools/ResourceManager.js';
import World from './level/World.js';

import Player from './player/Player.js';
import Stack from './item/Stack.js';

import BiomeGenerator from './level/generators/BiomeGenerator.js';
import OverworldGenerator from './level/generators/OverworldGenerator.js';
import SkyBlockGenerator from './level/generators/SkyBlockGenerator.js';
import OneChunkGenerator from './level/generators/OneChunkGenerator.js';

export default class Game extends EventTarget {

    static #ID = 0

    constructor(renderer, camera){
        super()
        this.updateSubs = [];
        window.game = this

        this.renderer = renderer;
        this.camera = camera;

        this.resourceManager = new ResourceManager()
        this.textureManager = new TextureManager()
        this.register

        this.player
        this.worlds = {}


        this.renderer.setAnimationLoop(this.Update.bind(this));

        this.stats = new Stats();
        document.getElementById('target').appendChild(this.stats.dom);
        this.Init()
    }

    get world() {
        this.worlds[this.player.currentWorld]
    }

    async spawn(worldType) {
        if(!this.worlds[worldType]) {
            this.worlds[worldType] = new World(worldType, this, new (Game.generators()[worldType])(this.register))
            await this.worlds[worldType].Init()
        }
        // if(!this.worlds.earth) {
        //     this.worlds.earth = new World('earth', this, new OverworldGenerator(this.register))

        //     await this.worlds.earth.Init()
        //     // this.worlds.earth = new World('earth', this, new SkyBlockGenerator(this.register))
        //     // this.worlds.earth = new World('earth', this, new OneChunkGenerator(this.register))
        // }
        this.worlds[worldType].spawn(this.player)       
    }

    async Init(){

        this.dispatchEvent(new CustomEvent('loading', { detail: 'Loading world data...'}))
        await this.resourceManager.fetchData()
        this.dispatchEvent(new CustomEvent('loading', { detail: 'Loading images...'}))
        await this.resourceManager.fetchImages()
            

        this.createSkybox()
        //this.createLight()

        this.dispatchEvent(new CustomEvent('loading', { detail: 'Loading textures...'}))
        await this.textureManager.load(ResourceManager.textures)

        this.dispatchEvent(new CustomEvent('loading', { detail: 'Registering blocks, items, entities,...'}))
        this.register = new RegisterManager()
        this.register.blocks.generateModels()
        this.register.items.generateIcons()
        
        console.debug('Loaded blocks:', this.register.blocks.map.size)
        console.debug('Loaded items:', this.register.items.map.size)
        console.debug('Loaded entities:', this.register.entities.map.size)
        console.debug('Loaded biomes:', this.register.biomes.map.size)
        console.debug('Loaded recipes:', this.register.recipes.map.size)
        console.debug('Loaded features:', this.register.features.map.size)
        

        window.clock.start()

        this.player = new Player(this.camera)
        // console.log(this.player)
        
        this.player.inventory.addStack(Stack.create('crafting_table', 1))
        this.player.inventory.addStack(Stack.create('furnace', 64))
        this.player.inventory.addStack(Stack.create('oak_log', 64))
        this.player.inventory.addStack(Stack.create('stone', 64))
        this.player.inventory.addStack(Stack.create('oak_vertical_slab', 64))
        this.player.inventory.addStack(Stack.create('oak_log', 64))
        this.player.inventory.addStack(Stack.create('slab', 64))
        this.player.inventory.addStack(Stack.create('slime_spawn_egg', 64))
        this.player.inventory.addStack(Stack.create('cow_spawn_egg', 64))
        this.player.inventory.addStack(Stack.create('water_still', 64))
        this.player.inventory.addStack(Stack.create('lava_still', 64))
        this.player.inventory.addStack(Stack.create('table', 64))
        this.player.inventory.addStack(Stack.create('chair', 64))
        this.player.inventory.addStack(Stack.create('furnace', 64))
        this.player.inventory.addStack(Stack.create('dispenser', 64))
        this.player.inventory.addStack(Stack.create('oak_log', 64))
        this.player.inventory.addStack(Stack.create('grass_block', 64))
        this.player.inventory.addStack(Stack.create('sand', 64))
        this.player.inventory.addStack(Stack.create('sand', 64))
        this.player.inventory.addStack(Stack.create('sand', 64))
        // this.player.inventory.addStack(Stack.create('cobblestone', 64))
        // this.player.inventory.addStack(Stack.create('glass', 64))
        
        this.dispatchEvent(new CustomEvent('loading', { detail: 'FINISH' }))
    }

    Update(){
        this.stats.update()
        for(let o of this.updateSubs){
            // console.log(o)
            const delta = o.clock.getDelta();
            o.obj.Update(delta)
        }

        let delta = window.clock.getDelta()
        for(let t of TextureManager.textures) {
            // TextureManager.animationMs += delta
            if (t.uniforms.time) {
                t.uniforms.time.value += delta
            }

            if (t.uniforms.cameraPos && this.spawned) {
                t.uniforms.cameraPos.value = this.player.eyePos
            }
            // if (t.uniforms.animFrame && TextureManager.animationMs > 100) {
            //     t.uniforms.animFrame.value++
            //     TextureManager.animationMs = 0
            // }

        }
        
        this.renderer.render(window.scene, this.camera);
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
            'resources/skybox/right.png',
            'resources/skybox/left.png',
            'resources/skybox/top.png',
            'resources/skybox/bottom.png',
            'resources/skybox/front.png',
            'resources/skybox/back.png',
        ]);
        // window.scene.background = new Color(80.0/255.0, 207.0/255.0, 242.0/255.0)
        window.scene.background = texture;
    }

    static generators() {
        return {
            'earth': OverworldGenerator,
            'skyblock': SkyBlockGenerator,
            'onechunk': OneChunkGenerator
        }
    }
}