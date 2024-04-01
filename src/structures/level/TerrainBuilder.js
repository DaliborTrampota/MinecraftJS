import { Vector3, BufferGeometry, BufferAttribute, Mesh } from 'three';
import { WORLD_SETTINGS } from "../../tools/Constants.js"
import TextureManager from "../../tools/TextureManager.js";
import VoxelBuilder from '../../tools/VoxelBuilder.js';
import Side from '../Side.js';

export default class TerrainBuilder {

    constructor(chunk) {
        /**The chunk object.
         * @type {import('./Chunk.js').default}
         */
        this.chunk = chunk
        this.vertices = []
        this.UVs = []
        this.ao = []
        this.chunkPosAttr

        this.groupStart = 0
        this.geometry = new BufferGeometry();
        this.mesh
    }

    build(pos, visible){
        this.createMeshData()
        this.createMesh()

        this.mesh.position.set(pos.x * WORLD_SETTINGS.chunkSize, 0, pos.y * WORLD_SETTINGS.chunkSize)
        this.mesh.visible = visible
        // this.mesh.receiveShadow = true
        // this.mesh.castShadow = true

        return this.mesh
    }

    rebuild() {
        this.vertices = []
        this.UVs = []
        this.ao = []

        this.geometry.clearGroups()
        this.groupStart = 0
        
        this.createMeshData(true)
        this.createMesh(true)

        return this.mesh
    }


    createMeshData(update = false){
        const materialGroups = {}
        
        for(let i = 0; i < WORLD_SETTINGS.chunkSize; ++i){
            for(let j = 0; j < WORLD_SETTINGS.chunkHeight; ++j){
                next:
                for(let k = 0; k < WORLD_SETTINGS.chunkSize; ++k){
                    const blockID = this.chunk.data[i][j][k]
                    if(!blockID) continue next

                    const blockData = this.chunk.register.getBlock(blockID)
                    if(!blockData) console.warn('createMesh no blockData', blockID, i, j, k)

                    const pos = new Vector3(i, j, k)
                    this.buildBlock(pos, blockData, materialGroups)
                    
                }
            }
        }
        for (let materialID in materialGroups) {
            this.processDrawCall(materialGroups[materialID])
        }
    }

    buildBlock(pos, blockData, materialGroups) {
        
        const breaking = this.chunk.breaking.find(o => o.pos.equals(pos))
        const blockState = this.chunk.getBlockState(pos)
        const faceChecks = Side.faceCheck()

        if(blockState) console.log(blockState)


        for(let side of Side.All) {
            const rotatedSide = blockState ? blockState.rotated(side) : side
            
            const shouldDrawFace = this.chunk.checkVoxel(faceChecks[side](pos.clone()), blockData, rotatedSide, false) // here probably want rotated side to get verts of the correct side
            if(blockState) console.log(side, rotatedSide, shouldDrawFace, blockState.block.key)
            if(!shouldDrawFace && !blockData.voxel) continue
            
            const { verts, uvs, material } = VoxelBuilder.buildFace(rotatedSide, blockState, blockData, !shouldDrawFace)
            
            for (let i = 0; i < verts.length; i += 3) {
                verts[i    ] += pos.x
                verts[i + 1] += pos.y
                verts[i + 2] += pos.z
            }


            const drawCall = (materialGroups[material] ??= new DrawCall(material))
            if (breaking)  {
                const breakID = TextureManager.atlasMap.get(`break_${breaking.progress}`)
                const breakUVs = VoxelBuilder.getUVs(blockData.getFace(side, !shouldDrawFace, true).uvs, TextureManager.textureMap.get(`break_${breaking.progress}`))
                const breakDrawCall = (materialGroups[breakID] ??= new DrawCall(breakID))
                breakDrawCall.vertices.push(...verts)
                breakDrawCall.uvs.push(...breakUVs)
                breakDrawCall.ao.push(...new Array(verts.length / 3).fill(1))
                //breakingArr.push({ offset: drawCall.vertices.length / 3, uvs: TextureManager.textureMap.get(`break_${breaking.progress}`) })
                console.log(breakDrawCall)
            }

            if (blockData.voxel || !WORLD_SETTINGS.ambientOcclusion) {
                drawCall.ao.push(...new Array(verts.length / 3).fill(1))
            } else {
                drawCall.ao.push(...this.getAO(new Vector3(verts[0], verts[1], verts[2]), pos.clone(), Side.getDirection(side), side))
            }

            drawCall.vertices.push(...verts)
            drawCall.uvs.push(...uvs)

        }
    }

    processDrawCall(drawCall) {
        // for(let { offset, textureIndex } of drawCall.breakingGroups){
        //     console.log(textureIndex, offset, this.groupStart)
        //     this.geometry.addGroup(this.groupStart + offset, 6, textureIndex)
        // }
        
        this.vertices = this.vertices.concat(drawCall.vertices)
        this.UVs = this.UVs.concat(drawCall.uvs)
        this.ao = this.ao.concat(drawCall.ao)

        const groupSize = drawCall.vertices.length / 3
        this.geometry.addGroup(this.groupStart, groupSize, drawCall.textureIndex)
        this.groupStart += groupSize
    }

    
    createMesh(update = false){
        this.geometry.setAttribute('ao', new BufferAttribute(new Float32Array(this.ao), 1))
        this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3))
        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(this.UVs), 2))
        if(!this.chunkPosAttr) this.chunkPosAttr = new BufferAttribute(new Float32Array(new Array(this.ao.length).fill([this.chunk.x, this.chunk.y]).flat()), 2)
        this.geometry.setAttribute('chunkPos', this.chunkPosAttr)
        this.geometry.computeVertexNormals()

        if(update) return //console.log(this.geometry)
        
        this.mesh = new Mesh(this.geometry, TextureManager.textures)
    }

    // first calc only for top faces, lookup values for other faces
    getAO(vert, pos, dir, side) {
        dir.multiplyScalar(0.5)
        let faceCenter = pos.clone().add(new Vector3(0.5, 0.5, 0.5)).add(dir)   
        
        const getBlock = (pos) => {
            let block = this.chunk.world.getVoxelFromPos(this.chunk.toWorldPosition(pos))
            if(block.material == 0) return false
            return true
        }
        
        let components = vert.sub(faceCenter).toArray().map(Boolean)

        let x = components.findIndex(Boolean)
        let y = components.findIndex((c, i) => c && i != x)
        
        faceCenter.add(dir) // go up a block
        let blocks = [
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(x, 1))),
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(y, 1))),
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(x, -1))),
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(y, -1))),
        ]
        let corners = [
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(x, 1).setComponent(y, 1))),
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(x, -1).setComponent(y, 1))),
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(x, -1).setComponent(y, -1))),
            getBlock(faceCenter.clone().add(Vector3.Zero.setComponent(x, 1).setComponent(y, -1))),
        ]
        let v1, v2, v3, v4

        if (side == Side.Up) {
            v1 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v2 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v3 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v4 = this.vertexAOType(blocks[0], blocks[1], corners[0])
        }

        if (side == Side.North) {
            v1 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v2 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v3 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v4 = this.vertexAOType(blocks[0], blocks[3], corners[3])
        }

        if (side == Side.East) {
            v1 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v2 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v3 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v4 = this.vertexAOType(blocks[2], blocks[1], corners[1])
        }

        if (side == Side.Down) {
            v1 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v2 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v3 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v4 = this.vertexAOType(blocks[0], blocks[3], corners[3])
        }

        if (side == Side.South) {
            v1 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v2 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v3 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v4 = this.vertexAOType(blocks[0], blocks[1], corners[0])
        }

        if (side == Side.West) {
            v1 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v2 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v3 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v4 = this.vertexAOType(blocks[2], blocks[3], corners[2])
        }

        return [
            v1, v2, v3, 
            v4, v3, v2
        ]
    }

    vertexAOType(side1, side2, corner) {
        if(side1 && side2) return 0.45
        if((side1 || side2) && corner) return 0.6
        if(side1 || side2 || corner) return 0.75
        return 1
    }

}


class DrawCall {
    constructor(textureIndex){
        this.textureIndex = textureIndex

        this.vertices = []
        this.uvs = []
        this.ao = []

        this.breakingGroups = []
    }
}