import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { DirectionsY, Directions } from '../../tools/Constants.js';
import TextureManager from "../../tools/TextureManager.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"
import BlockState from './BlockState.js';

export default class Block {

    constructor(key, material){
        this.key = key
        this.material = material
        this.hardness = 0
        this.resistance = 0

        this.opaque = false
        this.solid = true

        this.textures = {}
        this.variants = {}
        this.orientable = {}

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

    get isOrientable() {
        return Object.keys(this.orientable).length
    }

    get materials() {
        let textures = []
        let tempTextures = this.textures
        if(this.orientable.y) tempTextures = this.getTextures()
        else if(this.orientable.all) tempTextures = this.getTextures(BlockState.pillarUp())
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
        if(!this.isOrientable) return this.textures

        let front = 'north', back = 'south'
        let right = 'east', left = 'west'
        let top = 'up', bottom = 'down'

        if(this.orientable.y) {
            front = blockState?.side ?? 'north'
            back = DirectionsY[(DirectionsY[front] + 2) % 4]

            right = DirectionsY[(DirectionsY[front] + 1) % 4]
            left = DirectionsY[(DirectionsY[right] + 2) % 4]
        }else if(this.orientable.all) {
            front = blockState?.side ?? 'north'
            back = Directions[(Directions[front] + 3) % 6]

            right = Directions[(Directions[front] + 1) % 6]
            left = Directions[(Directions[right] + 3) % 6]

            top = Directions[(Directions[front] + 2) % 6]
            bottom = Directions[(Directions[top] + 3) % 6]
        }
        
        const textures = {}
            
        textures[front] = this.textures.front ?? this.textures.side
        textures[back] = this.textures.back ?? this.textures.side
        textures[top] = this.textures.top ?? this.textures.side
        textures[bottom] = this.textures.bottom ?? this.textures.side
        textures[right] = this.textures.right ?? this.textures.side
        textures[left] = this.textures.left ?? this.textures.side

        return textures
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
        if(data.orientableY) this.orientable.y = true
        if(data.orientable) this.orientable.all = true
        // const DEG_TO_RAD = Math.PI / 180
        // if(data.variants) {
        //     for(let key in data.variants) {
        //         let [prop, value] = key.split('=')
        //         if(prop == 'axis') {
        //             this.variants[prop] ??= {}
        //             this.variants[prop][value] = new Vector3((data.variants[key].x ?? 0) * DEG_TO_RAD, (data.variants[key].y ?? 0) * DEG_TO_RAD, (data.variants[key].z ?? 0) * DEG_TO_RAD)
        //         }
        //     }
        // }

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