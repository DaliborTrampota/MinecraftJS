import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { triangles, UVs, vertices } from '../../tools/Constants.js';
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

        this.entityClass = false

        this.loadData(window.blockData[key])
    }

    get hasEntity() {
        return this.entityClass
    }

    get isOrientable() {
        return Object.keys(this.orientable).length
    }

    get isInteractable() {
        return false
    }
    
    getStateForPlacement(context) {
        if(!this.isOrientable && !this.hasEntity) return false

        const state = new BlockState(context.hitResult.position.floor(), context.block)
        
        if(this.orientable.side) {
            state.direction = context.clickNormal
        } else if(this.orientable.facing) {
            state.direction = context.facingDir
        } else if(this.orientable.rotatable) {
            state.direction = context.facingDir

            if(context.clickAngle > 0.5) {
                const rotateAxis = context.facingDir.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).round()
                state.direction.applyAxisAngle(rotateAxis, -Math.PI/2).round()
            }
        }
        // console.log(state, state.side)
        if(this.hasEntity) {
            state.entity = new this.entityClass()
        }
        return state
    }

    getFaceFor(side, state, culled) {
        const data = {
            vertices: triangles[side].map(idx => vertices[idx].toArray()).flat(),
            uvs: UVs[side],
        }
        return data
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
        if(this.orientable.facing || this.orientable.rotatable) tempTextures = this.getTextures()
        else if(this.orientable.side) tempTextures = this.getTextures(BlockState.pillarUp(this))
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

        const { front, back, right, left, top, bottom } = blockState?.sides.rotated ?? { front: 'north', back: 'south', right: 'east', left: 'west', top: 'up', bottom: 'down'}

        const textures = {}
            
        textures[front] = this.textures.front ?? this.textures.side
        textures[back] = this.textures.back ?? this.textures.side
        textures[top] = this.textures.top ?? this.textures.side
        textures[bottom] = this.textures.bottom ?? this.textures.side
        textures[right] = this.textures.right ?? this.textures.side
        textures[left] = this.textures.left ?? this.textures.side

        return textures
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

    #setProperties(data) {
        this.renderSides = Boolean(data?.renderSides ?? true)
        if(data.type == 'facing') this.orientable.facing = true
        if(data.type == 'rotatable') this.orientable.rotatable = true
        if(data.type == 'orientable') this.orientable.side = true
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