import { TwoWayMap } from "./Utils.js";
import { TextureLoader, MeshBasicMaterial, NearestFilter   } from 'https://cdn.skypack.dev/three@0.129.0';

export default class Register {

    constructor(){
        this.loader = new TextureLoader()

        this.textures = []
        this.textureMap = new TwoWayMap();
        this.blockMap = new TwoWayMap();
        this.blockData = {}
        this.biomes = new Map();

        this.blockMap.add('air')
    }

    async Init(){
        await this.loadBlockData()
        await this.loadTextures()

        return true
    }

    async loadTextures(){//TODO make async?
        console.log('Loading textures...')

        let textures = []
        textures.push(...await fetch('/textures').then(r => r.json()))
        //textures.push(...await fetch('/textures/break').then(r => r.json()))

        for(let name of textures){
            let texture = this.loader.load(`resources/textures/blocks/${name}`)
            texture.magFilter = NearestFilter
            
            let blockName = name.split('.')[0] 
            this.textures.push(new MeshBasicMaterial({ map: texture, transparent: this.blockData[blockName] ? !this.blockData[blockName]?.solid : true }))
            this.textureMap.add(blockName)
        }

        console.log('Textures were loaded!')
    }

    async loadBlockData(){
        this.blockData = await fetch('/blockData').then(r => r.json())
    }

    block(name){ //make block builder
        this.blockMap.add(name);
        return this;
    }

    biome(name, temperature, humidity, altitude){//make biome builder
        this.biomes.set(name, { temperature, humidity, altitude })
        return this
    }    

    getBlockData(blockID){
        return this.blockData[this.blockMap.get(blockID)]
    }
}