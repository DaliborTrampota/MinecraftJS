import { Mesh } from 'https://cdn.skypack.dev/three@0.141.0';
import Register from "../Register.js"
import TextureManager from "../tools/TextureManager.js"
import VoxelBuilder from "../tools/VoxelBuilder.js"

export default class Block {

    constructor(name, material){
        this.name = name
        this.material = material
        this.hardness = 0
        this.resistance = 0

        this.textures = {}
        this.#setTextures()

        this.voxel = false
        this.solid = true
        this.transparent = false
        this.renderSides = true
        this.animation = false
        this.#setProperties()

        this.#generateModel()
        this.elements = false


        delete Register.blockData[this.name]
    }

    get materials() {
        let textures = []
        if(this.textures.all) textures = this.textures.all
        else {
            textures = [
                this.textures.east,    //right
                this.textures.west,     //left
                this.textures.up,      //top
                this.textures.down,   //bottom
                this.textures.north,
                this.textures.south
            ]
        }
        return Array.isArray(textures) ? textures.map(idx => TextureManager.textures[idx]): TextureManager.textures[textures]
    }

    setHardness(h){
        this.hardness = h
        return this
    }

    setResistance(r){
        this.resistance = r
        return this
    }

    #setTextures(){
        let data = Register.blockData[this.name]?.textures
        if(!data) return this
        for(let side in data){
            this.textures[side] = TextureManager.textureMap.get(data[side])
        }
        return this
    }

    #setProperties(){
        let data = Register.blockData[this.name]
        if(!data) console.warn('Missing block data for', this.name)
        this.solid = data?.solid ?? true
        this.transparent = Boolean(data?.transparent)
        this.renderSides = Boolean(data?.renderSides ?? true)

        if(data?.animation) 
            this.animation = data.animation 
    }

    #generateModel(){
        let data = Register.blockData[this.name]
        
        if(data?.elements){
            const { geometry, vertices, UVs, culling } = VoxelBuilder.build(data.elements)

            this.geometry = geometry
            this.vertices = vertices
            this.UVs = UVs
            this.culling = culling
            this.elements = data.elements

            this.voxel = true
        }
    }
}