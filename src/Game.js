import { Clock, DirectionalLight, DirectionalLightHelper, TextureLoader, MeshBasicMaterial, Mesh, PlaneGeometry, CubeTextureLoader, BoxGeometry, Box3 } from 'https://cdn.skypack.dev/three@0.141.0';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/libs/stats.module.js';
import { MATERIAL, PI_2, PLAYER_DIMENSIONS } from './tools/Constants.js';
import Register from './Register.js';
import Player from './structures/Player/Player.js';
import World from './structures/World.js';
import TextureManager from './tools/TextureManager.js';
import Block from './registers/Block.js';
import Biome from './registers/Biome.js';
import BlockItem from './registers/BlockItem.js';
import BiomeGenerator from './structures/Generators/BiomeGenerator.js';

export default class Game {

    constructor(renderer, camera){
        window.game = this

        this.renderer = renderer;
        this.camera = camera;

        this.textureManager = new TextureManager()
        this.register = new Register()

        this.player = new Player(this.createGameModel(), this.camera, this);
        this.world;

        this.stats = new Stats();
        document.getElementById('target').appendChild(this.stats.dom);

        this.updateSubs = [];
        this.renderer.setAnimationLoop(this.Update.bind(this));

        this.Init()
    }

    async Init(){
        this.createSkybox()
        window.scene.add(this.createLight())

        await this.register.load()
        await this.textureManager.load()

        const getBlock = (name) => {
            return this.register.blocks.get(name)
        }

        this.register
            .block(new Block('air', MATERIAL.AIR))
            .block(new Block('dirt', MATERIAL.SOLID))
            .block(new Block('grass_block', MATERIAL.SOLID))
            .block(new Block('stone', MATERIAL.SOLID))
            .block(new Block('cobblestone', MATERIAL.SOLID))
            .block(new Block('mossy_cobblestone', MATERIAL.SOLID))
            .block(new Block('gravel', MATERIAL.SOLID))
            .block(new Block('sand', MATERIAL.SOLID))
            .block(new Block('sandstone', MATERIAL.SOLID))
            .block(new Block('end_stone', MATERIAL.SOLID))
            .block(new Block('furnace', MATERIAL.SOLID))
            .block(new Block('glass', MATERIAL.SOLID))
            .block(new Block('water_still', MATERIAL.LIQUID))

            .biome(new Biome('forest').setTemperature(0.5).setHumidity(0.35).setAltitude(0.5))
            .biome(new Biome('desert').setTemperature(0.9).setHumidity(0.15).setAltitude(0.3))
            .biome(new Biome('hills').setTemperature(0.2).setHumidity(0.6).setAltitude(0.9))

            .item(new BlockItem(getBlock('grass_block')))
            .item(new BlockItem(getBlock('dirt')))
            .item(new BlockItem(getBlock('stone')))
            .item(new BlockItem(getBlock('sand')))
            
        this.world = new World(new BiomeGenerator(this.register), this.register, this.player);

        window.clock.start()
        this.addUpdateSub(this.player)
        this.addUpdateSub(this.world)
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

    createGameModel(){
        const geometry = new BoxGeometry(PLAYER_DIMENSIONS.width * 2, PLAYER_DIMENSIONS.height, PLAYER_DIMENSIONS.depth * 2);
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        const model = new Mesh( geometry, material );

        model.bb = new Box3().setFromObject(model)

        model.h = geometry.parameters.height
        model.w = geometry.parameters.width
        model.d = geometry.parameters.depth
        
        this.camera.parent = model
        this.camera.position.set(0, -PLAYER_DIMENSIONS.cameraOffset, 0)
        return model
    }
}