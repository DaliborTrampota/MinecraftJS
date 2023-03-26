import { Vector3, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.141.0';
import { ChunkHeight, ChunkSize, sides, triangles, UVs, vertices } from "../tools/Constants.js"
import TextureManager from "../tools/TextureManager.js";
import VoxelBuilder from '../tools/VoxelBuilder.js';

export default class TerrainBuilder {

    constructor(chunk) {
        this.chunk = chunk

        this.vertices = []
        this.UVs = []
        this.groupStart = 0
        this.geometry = new BufferGeometry();
        this.mesh
    }

    build(pos, visible){
        this.createMeshData()
        this.createMesh()

        this.mesh.position.set(pos.x * ChunkSize, 0, pos.y * ChunkSize)
        this.mesh.visible = visible

        return this.mesh
    }

    rebuild() {
        this.vertices = []
        this.UVs = []
        this.geometry.clearGroups()
        this.groupStart = 0
        
        this.createMeshData(true)
        this.createMesh(true)

        return this.mesh
    }


    createMeshData(update = false){//TODO filter only visible faces, sort them by texute, create a larger groups for each texture
        let textureGroups = {}
        for(let i = 0; i < ChunkSize; ++i){
            for(let j = 0; j < ChunkHeight; ++j){
                next:
                for(let k = 0; k < ChunkSize; ++k){

                    const blockID = this.chunk.data[i][j][k]
                    if(!blockID) continue next

                    const blockData = this.chunk.register.getBlock(blockID)
                    if(!blockData) console.log('createMesh no blockData', blockID, i, j, k)

                    const pos = new Vector3(i, j, k)
                    const breaking = this.chunk.breaking.find(o => o.pos.equals(pos))
                    if(breaking) breaking.textureIndex = TextureManager.textureMap.get(`break_${breaking.progress}`)
                    
                    const blockState = this.chunk.getBlockState(pos)
                    if(blockState) console.log(blockState.sides.map, blockState.side)

                    const mappedSides = blockState ? sides.map(s => ({ side: blockState.sides.map[s.side], dir: s.dir, oldSide: s.side })) : sides
                    sides:
                    for(let { side, dir, oldSide } of mappedSides) {
                        //const newSide = blockState?.sides.map[side] ?? side
                        if(this.chunk.checkVoxel(pos.clone().add(dir), blockData, side, update)) {
                            if(blockState) console.log(oldSide, side, dir, blockState.side, blockState.sides.map)
                            continue sides
                        }

                        const textureIndex = 'all' in blockData.textures ? blockData.textures.all : blockData.getTextures(blockState)[side]
                        const key = `${textureIndex}_${blockID}`

                        if(!textureGroups.hasOwnProperty(key)) textureGroups[key] = []
                        textureGroups[key].push({ side, oldSide, pos, breaking, blockState })
                    }
                }
            }
        }
        for(let key in textureGroups) this.buildTexture(...key.split('_').map(Number), textureGroups[key])
    }

    buildTexture(textureIndex, blockID, data){
        let groupCount = 0;
        let breakingGroups = []
        let blockData = this.chunk.register.getBlock(blockID)
        
        for(let o of data){
            let curGroupCount = 0
            if(blockData.voxel) {
                //let b = this.world.getVoxelFromPos(o.pos.clone().add(sides.find(s => s.side == o.side).dir))
                //console.log(o, b)
                if(o.blockState) console.log(o.side, o.blockState.side)
                const { vertices, uvs } = blockData.side(o.oldSide, true, o.blockState)
                
                for(let i = 0; i < vertices.length; i += 3) {
                    this.vertices.push(vertices[i    ] + o.pos.x)
                    this.vertices.push(vertices[i + 1] + o.pos.y)
                    this.vertices.push(vertices[i + 2] + o.pos.z)
                    groupCount++
                    curGroupCount++
                }
                this.UVs.push(...uvs)
            }else{
                for(let vert of triangles[o.side]){
                    this.vertices.push(vertices[vert].x + o.pos.x)
                    this.vertices.push(vertices[vert].y + o.pos.y)
                    this.vertices.push(vertices[vert].z + o.pos.z)
                }
                if(blockData.animation) this.UVs.push(...UVs[o.side].map((u, i) => i % 2 ? u / blockData.animation.frames : u))
                else this.UVs.push(...(blockData.orientable.side && o.blockState.shouldRotateUVsFor(o.side, textureIndex) ? VoxelBuilder.rotateUVs(UVs[o.side]) : UVs[o.side]))
                //console.log((blockData.orientable.side && UVs[o.side]))//o.blockState.shouldRotateUVsFor(o.side, textureIndex) ? VoxelBuilder.rotateUVs(UVs[o.side]) : 
                groupCount += 6
                curGroupCount += 6
            }
        
            if(o.breaking) breakingGroups.push({ start: this.groupStart + groupCount - curGroupCount, size: curGroupCount, texture: o.breaking.textureIndex })
            
        }
        
        this.geometry.addGroup(this.groupStart, groupCount, Number(textureIndex))
        for(let { start, size, texture } of breakingGroups) this.geometry.addGroup(start, size, texture)

        this.groupStart += groupCount;
    }
    
    createMesh(update = false){
        this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3))
        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(this.UVs), 2))

        if(update) return //console.log(this.geometry)
        
        this.mesh = new Mesh(this.geometry, TextureManager.textures)
    }

}