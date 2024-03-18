import { Vector3 } from "three"
import { UVs, triangles, vertices } from "../../tools/Constants.js"
import TextureManager from "../../tools/TextureManager.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"
import BlockState from "./BlockState.js"
import { calc2DAngle } from "../../tools/Utils.js"
import Side from "../Side.js"

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

    loadTextures(rawTextures) {
        if(!this.elements) return
        for(let e of this.elements) {
            for(let face in e.faces) {
                let textureSide = e.faces[face].texture
                if(textureSide) {
                    e.faces[face].texture = rawTextures[textureSide] ?? rawTextures['side'] ?? rawTextures['all']
                }
            }
        }
    }

    loadData(data) {
        if(!data) return console.warn('Missing block data for', this.key)
        this.voxel = data.elements && data.parent !== 'cube'
        this.elements = data.elements
        this.loadTextures(data.textures)
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

    generateModel(){
        if(!this.elements) return console.warn('Missing block model/parent for', this.key)
        const { geometry, culled, unculled, materials } = VoxelBuilder.build(this.elements, this.animation)

        this.geometry = geometry
        this.culled = culled
        this.unculled = unculled,
        this.textureID = materials.values().next().value
    }

    getFace(side, culling = false, rawUVs = false) {
        let verts = this.unculled.verts[side] ?? []
        let uvs = this.unculled[rawUVs ? 'rawUVs' : 'uvs'][side] ?? []
        
        if(!culling && this.culled.verts[side]) {
            verts = verts.concat(this.culled.verts[side])
            uvs = uvs.concat(this.culled[rawUVs ? 'rawUVs' : 'uvs'][side])
        } else {
            verts = [...verts]
            uvs = [...uvs]
        }
        
        return { verts, uvs, material: this.textureID }
    }

    getState(ctx) {
        if (!this.isOrientable) return false
        let facing, rotationAxis, rotation = 0
        
        switch (this.orientable) {
            case 'facing': { // furnace
                facing = ctx.player.facingNormal(true).negate()
                rotationAxis = Vector3.Up
                break
            }

            case 'cameraFacing': {
                facing = ctx.player.facingNormal().negate()
                rotation = calc2DAngle(Vector3.North, ctx.player.facingNormal(true).negate())
                break
            }

            case 'free': {
                // direction
                break
            }

            case 'normal': { //logs
                facing = ctx.hitResult.normal
                break
            }

        }
        
        // console.log(direction, rotationAxis)
        console.log(facing, rotation)
        return new BlockState(ctx.hitResult.position.floor(), ctx.block, {
            facing,
            rotationAxis,
            rotation,
        })
    }
}