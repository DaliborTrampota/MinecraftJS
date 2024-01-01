import { TextureLoader, MeshBasicMaterial, NearestFilter, DoubleSide, FrontSide, DefaultLoadingManager } from 'three';
import { TwoWayMap } from "./Utils.js";
import { Material } from "./Constants.js";
import Blocks from "../structures/registers/Blocks.js";


export default class TextureManager {

    static textureMap = new TwoWayMap()
    static textures = []

    constructor(){
        this.loader = new TextureLoader(DefaultLoadingManager)
        this.animatedTextures = {}
    }

    async loadBlock(textures, block) {
        for(let name of textures) {
            const textureName = name.split('.')[0]
            if(TextureManager.textureMap.has(textureName)) continue

            const texture = this.loader.load(`resources/textures/blocks/${name}`)
            texture.magFilter = NearestFilter
            //texture.anisotropy = 4
            
            const material = new MeshBasicMaterial({ map: texture, transparent: block?.transparent ?? textureName.startsWith('break_'), side: block?.material == Material.LIQUID ? DoubleSide : FrontSide })
            
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
    }

    async load(){
        console.info('Loading textures...')

        for(let name of window.textures){
            const texture = this.loader.load(`resources/textures/blocks/${name}`)
            texture.magFilter = NearestFilter
            //texture.anisotropy = 4
            
            const textureName = name.split('.')[0]
            let blockName = textureName
            let block
            do {
                block = Blocks.get(blockName)
                blockName = blockName.split('_').slice(0, -1).join('_')
            } while(!block && blockName)

            const transparent = block?.transparent ?? textureName.startsWith('break_')
            const material = new MeshBasicMaterial({ 
                map: texture, 
                transparent, 
                depthWrite: !transparent, 
                side: block?.material == Material.LIQUID ? DoubleSide : FrontSide, 
                name: textureName })

            TextureManager.textures.push(material)
            TextureManager.textureMap.add(textureName)
            
            if(block?.animation) {
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
        //console.log(TextureManager.textureMap)
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