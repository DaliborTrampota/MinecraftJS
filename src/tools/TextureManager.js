import { TextureLoader, NearestFilter, DoubleSide, FrontSide, DefaultLoadingManager, SRGBColorSpace, Vector3, ShaderMaterial, NearestMipMapLinearFilter } from 'three';



export default class TextureManager {

    /**
     * Holds UVs 
     */
    static textureMap = new Map()
    static atlasMap = new Map()
    static textures = []
    static animationMs = 0

    constructor(){
        this.loader = new TextureLoader(DefaultLoadingManager)
        this.animatedTextures = {}
    }

    static addAtlas(material, uvs) {
        for(let name in uvs) {
            TextureManager.textureMap.set(name, uvs[name])
            TextureManager.atlasMap.set(name, TextureManager.textures.length)
        }
        TextureManager.textures.push(material)
    }

    async load(){
        console.info('Loading textures...')

        const lightFrag = await fetch("/src/shaders/light.frag").then(r => r.text())
        const lightVert = await fetch("/src/shaders/light.vert").then(r => r.text())
        const liquidVert = await fetch("/src/shaders/liquid.vert").then(r => r.text())

        const liquidAtlas = this.loader.load(window.textures.atlases.liquids)
        const opaqueAtlas = this.loader.load(window.textures.atlases.opaque)
        const transparentAtlas = this.loader.load(window.textures.atlases.transparent)
        
        await new Promise((res) => this.loader.manager.onLoad = () => (res()))

        const liquidMaterial = this.createLiquidMaterial(liquidAtlas, liquidVert, lightFrag)
        const opaqueMaterial = this.createOpaqueMaterial(opaqueAtlas, lightVert, lightFrag)
        const transparentMaterial = this.createTransparentMaterial(transparentAtlas, lightVert, lightFrag)

        TextureManager.addAtlas(opaqueMaterial, window.textures.uvs.opaque)
        TextureManager.addAtlas(transparentMaterial, window.textures.uvs.transparent)
        TextureManager.addAtlas(liquidMaterial, window.textures.uvs.liquids)
            
        //     if(block?.animation) {
        //         this.animatedTextures[TextureManager.textureMap.get(textureName)] = {
        //             frame: 0,
        //             end: block.animation.frames,
        //             interval: block.animation.interval,
        //             step: 1 / block.animation.frames
        //         }
        //     }
        // }
        
        console.info('Textures were loaded!')
        //this.animateTextures()
    }

    //todo make one 100ms interval for all textures
    animateTextures(){
        for(let idx in this.animatedTextures){
            setInterval(() => {
                let data = this.animatedTextures[idx]
                //console.log(TextureManager.textures[idx])
                TextureManager.textures[idx].uniforms['animFrame'].value = data.frame * data.step

                data.frame++
                if(data.frame == data.end)
                    data.frame = 0

            }, this.animatedTextures[idx].interval)
        }
    }

    createLiquidMaterial(atlas, vertexShader, fragmentShader) {
        atlas.magFilter = NearestFilter
        atlas.minFilter = NearestMipMapLinearFilter
        //atlas.anisotropy = window.maxAnisotropy
        atlas.colorSpace = SRGBColorSpace

        return new ShaderMaterial({
            transparent: true, 
            side: DoubleSide, 
            name: 'liquids',
            uniforms: {
                textureAtlas: { value: atlas },
                lightDir: { value: new Vector3(0.5, -1, 1) },
                time: { value: 0 },
                animFrame: { value: 0 },
                //resolution: { value: new Vector2(500, 600) },
            },
            vertexShader,
            fragmentShader,
        })
    }

    createOpaqueMaterial(atlas, vertexShader, fragmentShader) {
        atlas.magFilter = NearestFilter
        atlas.minFilter = NearestMipMapLinearFilter
        //atlas.anisotropy = window.maxAnisotropy
        atlas.colorSpace = SRGBColorSpace

        return new ShaderMaterial({
            transparent: false, 
            side: FrontSide, 
            name: 'opaque',
            uniforms: {
                textureAtlas: { value: atlas },
                lightDir: { value: new Vector3(0.5, -1, 1) },
                //time: { value: 0 },
                animFrame: { value: 0 },
                //resolution: { value: new Vector2(500, 600) },
            },
            vertexShader,
            fragmentShader,
        })
    }

    createTransparentMaterial(atlas, vertexShader, fragmentShader) {
        atlas.magFilter = NearestFilter
        atlas.minFilter = NearestMipMapLinearFilter
        atlas.colorSpace = SRGBColorSpace

        return new ShaderMaterial({
            transparent: true, 
            depthWrite: false,
            side: FrontSide, 
            name: 'transparent',
            uniforms: {
                textureAtlas: { value: atlas },
                lightDir: { value: new Vector3(0.5, -1, 1) },
                // time: { value: 0 },
                animFrame: { value: 0 },
            },
            vertexShader,
            fragmentShader,
        })
    }


}