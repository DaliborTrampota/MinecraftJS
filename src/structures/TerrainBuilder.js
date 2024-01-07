import { Vector3, BufferGeometry, BufferAttribute, Mesh, WireframeGeometry, LineSegments } from 'three';
import { WORLD_SETTINGS, sides } from "../tools/Constants.js"
import TextureManager from "../tools/TextureManager.js";
import VoxelBuilder from '../tools/VoxelBuilder.js';

export default class TerrainBuilder {

    constructor(chunk) {
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


    createMeshData(update = false){
        let drawCalls = {} 

        class DrawCall {
            constructor(textureIndex, blockData){
                this.textureIndex = textureIndex
                this.blockData = blockData

                this.vertices = []
                this.uvs = []
                this.ao = []

                this.breakingGroups = []
            }
        }


        for(let i = 0; i < WORLD_SETTINGS.chunkSize; ++i){
            for(let j = 0; j < WORLD_SETTINGS.chunkHeight; ++j){
                next:
                for(let k = 0; k < WORLD_SETTINGS.chunkSize; ++k){
                    const blockID = this.chunk.data[i][j][k]
                    if(!blockID) continue next

                    const blockData = this.chunk.register.getBlock(blockID)
                    if(!blockData) console.warn('createMesh no blockData', blockID, i, j, k)

                    const pos = new Vector3(i, j, k)
                    const breaking = this.chunk.breaking.find(o => o.pos.equals(pos))

                    const blockState = this.chunk.getBlockState(pos)

                    //const mappedSides = blockState ? sides.map(s => ({ side: blockState.sides.map[s.side], dir: s.dir, oldSide: s.side })) : sides
                    sides:
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

                        if (blockData.voxel || !WORLD_SETTINGS.ambientOcclusion) {
                            drawCall.ao.push(...new Array(verts.length / 3).fill(1))
                        } else {
                            drawCall.ao.push(...this.getAO(new Vector3(verts[0], verts[1], verts[2]), pos.clone(), dir.clone(), side))
                        }

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
        this.ao.push(...drawCall.ao)

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

        if (side == 'up') {
            v1 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v2 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v3 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v4 = this.vertexAOType(blocks[0], blocks[1], corners[0])
        }

        if (side == 'north') {
            v1 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v2 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v3 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v4 = this.vertexAOType(blocks[0], blocks[3], corners[3])
        }

        if (side == 'east') {
            v1 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v2 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v3 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v4 = this.vertexAOType(blocks[2], blocks[1], corners[1])
        }

        if (side == 'down') {
            v1 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v2 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v3 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v4 = this.vertexAOType(blocks[0], blocks[3], corners[3])
        }

        if (side == 'south') {
            v1 = this.vertexAOType(blocks[2], blocks[3], corners[2])
            v2 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v3 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v4 = this.vertexAOType(blocks[0], blocks[1], corners[0])
        }

        if (side == 'west') {
            v1 = this.vertexAOType(blocks[0], blocks[1], corners[0])
            v2 = this.vertexAOType(blocks[2], blocks[1], corners[1])
            v3 = this.vertexAOType(blocks[0], blocks[3], corners[3])
            v4 = this.vertexAOType(blocks[2], blocks[3], corners[2])
        }

        if(pos.x == 5 &&pos.y == 26 &&pos.z ===10)console.log(blocks, corners, v1, v2, v3, v4, x, y, faceCenter, side, Vector3.Zero)
        //if(this.chunk.x == 0 && this.chunk.y == 0) console.log(v1, v2, v3, v4, blocks, corners)

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