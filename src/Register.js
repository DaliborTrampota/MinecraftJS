import { TwoWayMap } from "./tools/Utils.js";
import { TextureLoader, MeshBasicMaterial, NearestFilter   } from 'https://cdn.skypack.dev/three@0.129.0';

export default class Register {

    constructor(){
        this.loader = new TextureLoader()

        this.textures = []
        this.animatedTextures = {}
        this.textureMap = new TwoWayMap();
        this.blockMap = new TwoWayMap();
        this.blockData = {}
        this.biomes = new Map();

        this.blockMap.add('air')
    }

    async Init(){
        await this.loadBlockData()
        await this.loadTextures()
        this.animateTextures()
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
            let blockData = this.blockData[blockName]

            this.textures.push(new MeshBasicMaterial({ map: texture, transparent: !blockData?.solid || true }))
            this.textureMap.add(blockName)

            if(blockData?.animated){
                this.animatedTextures[this.textureMap.get(blockName)] = {
                    frame: 0,
                    end: blockData.animation.frames,
                    interval: blockData.animation.interval,
                    step: 1 / blockData.animation.frames
                }
            }
        }

        console.log('Textures were loaded!')
    }

    async loadBlockData(){
        this.blockData = await fetch('/blockData').then(r => r.json())//.then(o => new Block())
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

    animateTextures(){
        for(let idx in this.animatedTextures){
            setInterval(() => {
                let data = this.animatedTextures[idx]
                this.textures[idx].map.offset.set(0, data.frame * data.step)

                data.frame++
                if(data.frame == data.end)
                    data.frame = 0

            }, this.animatedTextures[idx].interval)
        }
    }
}