import { TwoWayMap } from "./Utils.js";
import { TextureLoader, MeshBasicMaterial, NearestFilter, DoubleSide, FrontSide, DefaultLoadingManager } from 'https://cdn.skypack.dev/three@0.141.0';
import Register from "../structures/registers/RegisterManager.js";
import { Material } from "./Constants.js";


export default class TextureManager {

    static textureMap = new TwoWayMap()
    static textures = []

    constructor(){
        this.loader = new TextureLoader(DefaultLoadingManager)
        this.animatedTextures = {}
    }

    async load(register){
        console.info('Loading textures...')

        let textures = []
        textures.push(...await fetch('/textures').then(r => r.json()))

        for(let name of textures){
            const texture = this.loader.load(`resources/textures/blocks/${name}`)
            texture.magFilter = NearestFilter
            //texture.anisotropy = 4
            
            const textureName = name.split('.')[0]
            const block = register.getBlock(textureName)
            const material = new MeshBasicMaterial({ map: texture, transparent: block?.opaque ?? textureName.startsWith('break_'), side: block?.material == Material.LIQUID ? DoubleSide : FrontSide })
            
            TextureManager.textures.push(material)
            TextureManager.textureMap.add(textureName)

            if(block?.animated){
                this.animatedTextures[TextureManager.textureMap.get(textureName)] = {
                    frame: 0,
                    end: block.animation.frames,
                    interval: block.animation.interval,
                    step: 1 / block.animation.frames
                }
            }
        }
        
        await new Promise((res) => this.loader.manager.onLoad = () => (res()))
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