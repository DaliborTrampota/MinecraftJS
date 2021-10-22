import { Clock, DirectionalLight, DirectionalLightHelper, TextureLoader, MeshBasicMaterial, Mesh, PlaneGeometry, CubeTextureLoader } from 'https://cdn.skypack.dev/three@0.129.0';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.129.0/examples/jsm/libs/stats.module.js';
import { PI_2 } from './Constants.js';
import Register from './Register.js';
import Player from './Player.js';
import World from './World.js';

export default class Game {
    constructor(renderer, scene, clock, camera){
        this.renderer = renderer;
        this.scene = scene;
        this.clock = clock;
        this.camera = camera;

        this.register = new Register();
        this.player = new Player(this.camera, this);
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
            .biome('forest', 0.9, 1.2, 1.2)
            .biome('desert', 1.8, 0.2, 1)
            .biome('hills', 0.2, 1.5, 1.8)

        this.world = new World(this, this.register, this.player);
        this.addUpdateSub(this.player)
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

    get Scene() { 
        return this.scene;
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
}