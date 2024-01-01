import { Vector3 } from "three"
import { UVs, triangles, vertices } from "../../tools/Constants.js"
import TextureManager from "../../tools/TextureManager.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"
import BlockState from "./BlockState.js"
import { calc2DAngle } from "../../tools/Utils.js"

export default class Block {

    constructor(key, material){
        this.key = key
        this.material = material
        this.hardness = 0
        this.resistance = 0

        this.transparent = false
        this.solid = true

        this.textures = {}
        this.variants = {}
        this.orientable = false

        this.voxel = false
        this.elements = false
        this.animation = false

        this.entityClass = false

        this.loadData(window.blockData[key])
    }

    get hasEntity() {
        return Boolean(this.entityClass)
    }

    get isOrientable() {
        return this.orientable
    }

    get isInteractable() {
        return false
    }
    
    setHardness(h){
        this.hardness = h
        return this
    }

    setResistance(r){
        this.resistance = r
        return this
    }

    isTransparent() {
        this.transparent = true
        return this
    }

    hasNoCollisions() {
        this.solid = false
        return this
    }

    loadTextures() {
        if(this.rawTextures.all) this.textures.all = TextureManager.textureMap.get(this.rawTextures.all)
        else {
            this.textures.north = TextureManager.textureMap.get(this.rawTextures.front ?? this.rawTextures.side)
            this.textures.south = TextureManager.textureMap.get(this.rawTextures.back ?? this.rawTextures.side)
            this.textures.east = TextureManager.textureMap.get(this.rawTextures.left ?? this.rawTextures.side)
            this.textures.west = TextureManager.textureMap.get(this.rawTextures.right ?? this.rawTextures.side)
            this.textures.up = TextureManager.textureMap.get(this.rawTextures.top ?? this.rawTextures.side)
            this.textures.down = TextureManager.textureMap.get(this.rawTextures.bottom ?? this.rawTextures.side)
        }
        delete this.rawTextures
        this.#generateModel()
    }

    loadData(data) {
        if(!data) return console.warn('Missing block data for', this.key)
        this.rawTextures = data.textures
        this.elements = data?.elements
        this.orientable = data.rotation
        
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

    #generateModel(){
        if(this.elements){
            const { geometry, vertices, UVs } = VoxelBuilder.build(this.elements, this.textures)

            this.geometry = geometry
            this.vertices = vertices
            this.UVs = UVs

            this.voxel = true
        }
    }
    
    get materials() { // this is only used for photobooth?
        let textures = this.textures.all ? this.textures.all : Object.values(this.textures)
        return Array.isArray(textures) ? textures.map(idx => TextureManager.textures[idx]): TextureManager.textures[textures]
    }

    getFace(side) {
        let verts = [], uvs = []
        for(let vert of triangles[side]) {
            verts.push(vertices[vert].x)
            verts.push(vertices[vert].y)
            verts.push(vertices[vert].z)
        }  
        uvs.push(...UVs[side])
        return { verts, uvs }
    }

    getState(ctx) {
        if (!this.isOrientable) return false
        let direction, rotationAxis, rotation = 0
        
        switch (this.orientable) {
            case 'facing': { // furnace
                direction = ctx.player.facingNormal(true).negate()
                rotationAxis = Vector3.Up
                break
            }

            case 'cameraFacing': {
                direction = ctx.player.facingNormal().negate()
                rotation = calc2DAngle(Vector3.North, ctx.player.facingNormal(true).negate())
                break
            }

            case 'free': {
                // direction
                break
            }

            case 'normal': { //logs
                direction = ctx.hitResult.normal
                break
            }

        }
        
        if (!rotationAxis) {
            rotationAxis = Vector3.North.cross(direction)
            if (rotationAxis.lengthSq() == 0) {
                rotationAxis = Vector3.Up
            } else {
                rotationAxis.x = Math.abs(rotationAxis.x);
                rotationAxis.y = Math.abs(rotationAxis.y);
                rotationAxis.z = Math.abs(rotationAxis.z);
            }
        }
        // console.log(direction, rotationAxis)

        return new BlockState(ctx.hitResult.position.floor(), ctx.block, {
            direction,
            rotationAxis,
            rotation,
        })
    }
}