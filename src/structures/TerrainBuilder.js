import { Vector3, BufferGeometry, BufferAttribute, Mesh, WireframeGeometry, LineSegments } from 'three';
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
        
        if(this.chunk.world.player.controller.debug.active) {
            const wireframe = new WireframeGeometry(this.geometry)
            wireframe.translate(this.mesh.position.x, 0, this.mesh.position.y)
            const line = new LineSegments( wireframe );
            line.material.depthTest = false;
            line.material.opacity = 0.5;
            line.material.transparent = true;
            window.scene.add(line)

            setTimeout(() => window.scene.remove(line), 5_000)
        }

        return this.mesh
    }


    createMeshData(update = false){//TODO filter only visible faces, sort them by texute, create a larger groups for each texture
        let drawCalls = {} 

        class DrawCall {
            constructor(textureIndex, blockData){
                this.textureIndex = textureIndex
                this.blockData = blockData
                this.vertices = []
                this.uvs = [],
                this.breakingGroups = []
            }
        }


        for(let i = 0; i < ChunkSize; ++i){
            for(let j = 0; j < ChunkHeight; ++j){
                next:
                for(let k = 0; k < ChunkSize; ++k){
                    const blockID = this.chunk.data[i][j][k]
                    if(!blockID) continue next

                    const blockData = this.chunk.register.getBlock(blockID)
                    if(!blockData) console.warn('createMesh no blockData', blockID, i, j, k)

                    const pos = new Vector3(i, j, k)
                    const breaking = this.chunk.breaking.find(o => o.pos.equals(pos))

                    const blockState = this.chunk.getBlockState(pos)//{ angle: 0, rotationAxis: new Vector3(0, 1, 0) }
                    if(blockState) console.log(blockState)

                    for(let { dir, side } of sides) {
                        const rotatedSide = blockState ? VoxelBuilder.rotateSide(side, -blockState.angle, blockState.rotationAxis) : side
                        const shouldDrawFace = this.chunk.checkVoxel(pos.clone().add(dir), blockData, rotatedSide, false)
                        if(!shouldDrawFace && !blockData.voxel) continue
                        
                        const textureIndex = blockData.textures.all ?? blockData.textures[rotatedSide]
                        if(blockState) console.log(side, rotatedSide, textureIndex)
                        const drawCall = (drawCalls[textureIndex] ??= new DrawCall(textureIndex, blockData))
                        const { verts, uvs } = VoxelBuilder.buildFace(pos, blockData.voxel ? rotatedSide : side, blockState, blockData, !shouldDrawFace)
                        if (breaking) 
                            drawCall.breakingGroups.push({ offset: drawCall.vertices.length / 3, textureIndex: TextureManager.textureMap.get(`break_${breaking.progress}`) })

                        drawCall.vertices.push(...verts)
                        drawCall.uvs.push(...uvs)
                    }
                }
            }
        }
        for (let textureId in drawCalls) {
            this.processDrawCall(drawCalls[textureId])
        }
    }

    processDrawCall(drawCall) {
        for(let { offset, textureIndex } of drawCall.breakingGroups)
            this.geometry.addGroup(this.groupStart + offset, 6, textureIndex)
            
        this.vertices.push(...drawCall.vertices)
        this.UVs.push(...drawCall.uvs)

        const groupSize = drawCall.vertices.length / 3
        this.geometry.addGroup(this.groupStart, groupSize, drawCall.textureIndex)
        this.groupStart += groupSize
    }

    
    createMesh(update = false){
        this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3))
        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(this.UVs), 2))

        if(update) return //console.log(this.geometry)
        
        this.mesh = new Mesh(this.geometry, TextureManager.textures)
    }

}