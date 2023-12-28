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
                    if(blockData.voxel) console.log(blockData, blockState)

                    sides:
                    for(let { side, dir } of sides) {
                        if(this.chunk.checkVoxel(pos.clone().add(dir), blockData, side, update)) continue sides

                        
                        let textureSide = side
                        if(blockData.isOrientable) {
                            textureSide = VoxelBuilder.rotateSide(side, blockState.angle, new Vector3(0, 1, 0))
                            console.log(side, textureSide, blockState.angle, TextureManager.textureMap.get(blockData.getTextures()[textureSide]))
                        }

                        const textureIndex = 'all' in blockData.textures ? blockData.textures.all : blockData.getTextures()[textureSide]
                        const key = `${textureIndex}_${blockID}`

                        if(!textureGroups.hasOwnProperty(key)) textureGroups[key] = []
                        textureGroups[key].push({ side, pos, breaking, blockState })
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
        
        for(let o of data) {
            let curGroupCount = 0
            let { vertices, uvs } = blockData.getFaceFor(o.side, o.blockState, true)
            if(textureIndex == 14) console.log(blockData.getTextures(), vertices, uvs)
            
            for(let i = 0; i < vertices.length; i += 3) {
                this.vertices.push(vertices[i    ] + o.pos.x)
                this.vertices.push(vertices[i + 1] + o.pos.y)
                this.vertices.push(vertices[i + 2] + o.pos.z)
                groupCount++
                curGroupCount++
            }
            if(blockData.animation) uvs = uvs.map((u, i) => i % 2 ? u / blockData.animation.frames : u)
            //if(o.blockState && blockData.orientable.side && o.blockState.shouldRotateUVsFor(o.side, textureIndex)) uvs = VoxelBuilder.rotateUVs(uvs)
            this.UVs.push(...uvs)
     
            if(o.breaking) breakingGroups.push({ 
                start: this.groupStart + groupCount - curGroupCount, 
                size: curGroupCount, 
                texture: o.breaking.textureIndex
            })
            
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