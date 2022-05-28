import { Clock, DirectionalLight, DirectionalLightHelper, TextureLoader, MeshBasicMaterial, Mesh, PlaneGeometry, CubeTextureLoader, BoxGeometry } from 'https://cdn.skypack.dev/three@0.129.0';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.129.0/examples/jsm/libs/stats.module.js';
import { PI_2 } from './tools/Constants.js';
import Register from './Register.js';
import Player from './Player.js';
import World from './structures/World.js';

export default class Game {

    constructor(renderer, scene, clock, camera){
        this.renderer = renderer;
        this.scene = scene;
        this.clock = clock;
        this.camera = camera;

        this.gravity = -9.81 * 2

        this.register = new Register();
        this.player = new Player(this.createGameModel(), this.camera, this);
        this.world;

        this.stats = new Stats();
        document.getElementById('target').appendChild(this.stats.dom);

        this.updateSubs = [];
        this.renderer.setAnimationLoop(this.Update.bind(this));

        this.Init()
    }

    async Init(){
        let textureLoad = this.register.Init()

        this.createSkybox()
        this.scene.add(this.createLight())

        await textureLoad

        this.register
            .block('dirt')
            .block('grass_block')
            .block('stone')
            .block('cobblestone')
            .block('mossy_cobblestone')
            .block('sand')
            .block('gravel')
            .block('sandstone')
            .block('end_stone')
            .block('furnace')
            .block('water_still')
            .biome('forest', 0.5, 0.35, 0.5)
            .biome('desert', 0.9, 0.15, 0.3)
            .biome('hills', 0.2, 0.6, 0.9)

        this.world = new World(this, this.register, this.player);
        this.addUpdateSub(this.player)
        this.addUpdateSub(this.world)
    }

    Update(){
        this.stats.update()
        for(let o of this.updateSubs){
            const delta = o.clock.getDelta();
            o.obj.Update(delta)
        }
        this.renderer.render(this.scene, this.camera);
        //console.log(this.renderer.info.render.calls)
    }

    addUpdateSub(obj){
        if('Update' in obj) this.updateSubs.push({ obj, clock: new Clock()})
        else console.error('No Update method!');
    }

    createLight(){
        const light = new DirectionalLight( 0xFFFFFF );
        light.position.set(0, 10, 0)
        const helper = new DirectionalLightHelper( light, 5 );
        return helper;
    }
    
    testFloor(){
        const geometry = new PlaneGeometry( 30, 30 );
    
        const loader = new TextureLoader()
        const texture = loader.load('resources/textures/blocks/dirt.png')
    
        const material = new MeshBasicMaterial( {map: texture } );
        const plane = new Mesh( geometry, material );
        plane.rotateX(-PI_2)
        plane.position.set(0, -10, 0)
        
        return plane
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
        this.scene.background = texture;
    }

    createGameModel(){
        const geometry = new BoxGeometry( 0.8, 2, 0.5 );
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        const model = new Mesh( geometry, material );
        model.h = 2
        model.w = 0.8
        model.d = 0.5
        this.camera.parent = model
        return model
    }
}