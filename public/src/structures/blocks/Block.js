import { Vector3 } from "three"
import VoxelBuilder from "../../tools/VoxelBuilder.js"
import BlockState from "./BlockState.js"
import { angleToAxis } from "../../tools/Utils.js"

export default class Block {

    constructor(key, material){
        this.key = key
        this.material = material
        this.hardness = 0
        this.resistance = 0

        this.transparent = false
        this.solid = true

        this.textures = {}
        this.orientable = false

        this.voxel = false
        this.elements = false
        this.geometry = false
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

            case 'cameraFacing': { // dispenser
                facing = ctx.player.facingNormal(true).negate()
                let facingY = ctx.player.facingNormal().negate()
                if(facingY.y) {
                    rotation = angleToAxis(facingY, facing)
                }
                break
            }

            case 'free': { //what? i dont remember anymore what this is supposed to be
                // direction
                break
            }

            case 'normal': { //logs
                facing = ctx.hitResult.normal
                break
            }

        }
        
        console.debug(facing, rotation)
        return new BlockState(ctx.hitResult.position.floor(), ctx.block, {
            facing,
            rotationAxis,
            rotation,
        })
    }
}