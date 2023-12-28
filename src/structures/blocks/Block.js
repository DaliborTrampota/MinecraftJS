import { UVs, triangles, vertices } from "../../tools/Constants.js"
import TextureManager from "../../tools/TextureManager.js"
import VoxelBuilder from "../../tools/VoxelBuilder.js"

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
        this.orientable = {}

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

    getFace(side, pos) {
        let verts = [], uvs = []
        for(let vert of triangles[side]){
            verts.push(vertices[vert].x + pos.x)
            verts.push(vertices[vert].y + pos.y)
            verts.push(vertices[vert].z + pos.z)
        }  
        uvs.push(...UVs[side])
        return { verts, uvs }
    }
}