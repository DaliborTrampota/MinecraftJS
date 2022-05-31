import { TwoWayMap } from "./Utils.js";
import { TextureLoader, MeshBasicMaterial, NearestFilter, DoubleSide, FrontSide } from 'https://cdn.skypack.dev/three@0.141.0';
import Register from "../Register.js";
import { MATERIAL } from "./Constants.js";


export default class TextureManager {

    static textureMap = new TwoWayMap()
    static textures = []

    constructor(){
        this.loader = new TextureLoader()
        this.animatedTextures = {}
    }

    async load(register){//TODO make async?
        console.info('Loading textures...')

        let textures = []
        textures.push(...await fetch('/textures').then(r => r.json()))
        //textures.push(...await fetch('/textures/break').then(r => r.json()))

        for(let name of textures){
            let texture = this.loader.load(`resources/textures/blocks/${name}`)
            texture.magFilter = NearestFilter
            
            let blockName = name.split('.')[0] 
            let blockData = Register.blockData[blockName]
            let material = new MeshBasicMaterial({ map: texture, transparent: !blockData?.solid || true, side: blockData?.liquid ? DoubleSide : FrontSide })
            
            TextureManager.textures.push(material)
            TextureManager.textureMap.add(blockName)

            if(blockData?.animated){
                this.animatedTextures[TextureManager.textureMap.get(blockName)] = {
                    frame: 0,
                    end: blockData.animation.frames,
                    interval: blockData.animation.interval,
                    step: 1 / blockData.animation.frames
                }
            }
        }

        console.log('Textures were loaded!')
        this.animateTextures()
    }

    
    //todo make one 100ms interval for all textures
    animateTextures(){
        for(let idx in this.animatedTextures){
            setInterval(() => {
                let data = this.animatedTextures[idx]
                TextureManager.textures[idx].map.offset.set(0, data.frame * data.step)

                data.frame++
                if(data.frame == data.end)
                    data.frame = 0

            }, this.animatedTextures[idx].interval)
        }
    }

}