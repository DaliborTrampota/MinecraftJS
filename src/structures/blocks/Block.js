import { Mesh } from 'https://cdn.skypack.dev/three@0.141.0';
import { DirectionsY } from '../../tools/Constants.js';
import TextureManager from "../../tools/TextureManager.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"

export default class Block {

    constructor(key, material){
        this.key = key
        this.material = material
        this.hardness = 0
        this.resistance = 0

        this.opaque = false
        this.solid = true

        this.textures = {}

        this.voxel = false
        this.elements = false
        this.renderSides = true
        this.animation = false
    }

    loadData(data) {
        if(!data) return console.warn('Missing block data for', this.key)

        this.rawTextures = data.textures
        this.#setProperties(data)
        this.#generateModel(data.elements)
    }

    get materials() {
        let textures = []
        let tempTextures = this.textures
        if(this.orientableY) tempTextures = this.getTextures()
        if(this.textures.all) textures = this.textures.all
        else {
            textures = [
                tempTextures.east,    //right
                tempTextures.west,     //left
                tempTextures.up,      //top
                tempTextures.down,   //bottom
                tempTextures.north,
                tempTextures.south
            ]
        }
        return Array.isArray(textures) ? textures.map(idx => TextureManager.textures[idx]): TextureManager.textures[textures]
    }

    getTextures(blockState) {
        if(this.orientableY) {
            const back = blockState?.direction ?? 'south'
            const front = DirectionsY[(DirectionsY[back] + 2) % 4]

            const right = DirectionsY[(DirectionsY[front] + 1) % 4]
            const left = DirectionsY[(DirectionsY[right] + 2) % 4]

            const top = 'up'
            const bottom = 'down'
            
            const textures = {
                [front]: this.textures.front,
            }

            textures[back] = this.textures.back ?? this.textures.side
            textures[top] = this.textures.top ?? this.textures.side
            textures[bottom] = this.textures.bottom ?? this.textures.side
            textures[right] = this.textures.right ?? this.textures.side
            textures[left] = this.textures.left ?? this.textures.side
            
            return textures
        }
        return this.textures
    }

    side(side, culled) {
        const data = {
            vertices: this.vertices[side].filter(o => !culled ? o.type == 'unculled' : true).map(o => o.data).flat(),
            uvs: this.UVs[side].filter(o => !culled ? o.type == 'unculled' : true).map(o => o.data).flat(),
        }
        return data
    }

    setHardness(h){
        this.hardness = h
        return this
    }

    setResistance(r){
        this.resistance = r
        return this
    }

    isOpaque() {
        this.opaque = true
        return this
    }

    hasNoCollisions() {
        this.solid = false
        return this
    }

    loadTextures() {
        for(let side in this.rawTextures) {
            this.textures[side] = TextureManager.textureMap.get(this.rawTextures[side])
        }
        delete this.rawTextures
    }

    #setProperties(data){
        this.renderSides = Boolean(data?.renderSides ?? true)
        this.orientableY = Boolean(data?.orientableY ?? false)

        if(data?.animation) 
            this.animation = data.animation 
    }

    #generateModel(elements){
        if(elements){
            const { geometry, vertices, UVs } = VoxelBuilder.build(elements)

            this.geometry = geometry
            this.vertices = vertices
            this.UVs = UVs
            this.elements = elements

            this.voxel = true
        }
    }
}