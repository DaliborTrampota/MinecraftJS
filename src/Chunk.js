import { ChunkHeight, ChunkSize, sides, triangles, UVs, vertices } from "./Constants.js"
import { create3DArray } from "./Utils.js"
import { Vector3, Vector2, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.129.0';

export default class Chunk {
    constructor(x, y, world, ){
        this.x = x
        this.y = y

        this.world = world;

        this.vertices = []
        this.UVs = []
        this.geometry;
        this.mesh;

        this.data = []
        
        this.groupStart = 0
        this.enabled = false

        this.Init()
    }

    get register(){
        return this.world.register;
    }

    get scene(){
        return this.world.game.scene;
    }

    Init(){
        this.data = create3DArray(ChunkSize, ChunkHeight, ChunkSize);
        this.geometry = new BufferGeometry();

        this.populate();
    }

    generate(){
        this.createMeshData();
        this.createMesh();

        this.mesh.position.set(this.x * ChunkSize, 0, this.y * ChunkSize)
        this.mesh.visible = this.enabled

        return this.mesh
    }

    populate(){
        //let height = Math.floor(this.world.noise.Get(i + this.x * ChunkSize, 0.0, k + this.y * ChunkSize)) + 20            
        for(let i = 0; i < ChunkSize; ++i){
            for(let j = 0; j < ChunkHeight; ++j){
                for(let k = 0; k < ChunkSize; ++k){
                    this.data[i][j][k] = this.world.getVoxel(new Vector3(i + this.x * ChunkSize, j, k + this.y * ChunkSize))
                }
            }
        }
    }

    createMeshData(){//TODO filter only visible faces, sort them by texute, create a larger groups for each texture
        let textureGroups = {}
        for(let i = 0; i < ChunkSize; ++i){
            for(let j = 0; j < ChunkHeight; ++j){
                next:
                for(let k = 0; k < ChunkSize; ++k){
                    let blockID = this.data[i][j][k]
                    if(!blockID) continue next;
                    let blockData = this.register.getBlockData(blockID)
                    sides:
                    for(let q = 0; q < 6; ++q){
                        let {side, dir} = sides[q]
                        let pos = new Vector3(i, j, k)
                        if(this.checkVoxel(new Vector3(i, j, k).add(dir))) continue sides;

                        let textureIndex = blockData.textures.all ? this.register.textureMap.get(blockData.textures.all) : this.register.textureMap.get(blockData.textures[side])

                        if(textureGroups.hasOwnProperty(textureIndex)) textureGroups[textureIndex].push({ side, pos })
                        else textureGroups[textureIndex] = [{ side, pos }]
                    }
                }
            }
        }
        for(let textureIndex in textureGroups) this.buildTexture(textureIndex, textureGroups[textureIndex])
    }

    createMesh(update){
        this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.vertices), 3))
        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(this.UVs), 2))

        if(update) return
        
        this.mesh = new Mesh(this.geometry, this.register.textures)
    }

    buildTexture(textureIndex, data){
        let groupCount = 0;
        for(let o of data){
            for(let vert of triangles[o.side]){
                this.vertices.push(vertices[vert].x + o.pos.x)
                this.vertices.push(vertices[vert].y + o.pos.y)
                this.vertices.push(vertices[vert].z + o.pos.z)
            }
            this.UVs.push(...UVs[o.side])
            groupCount += 6
        }
        this.geometry.addGroup(this.groupStart, groupCount, textureIndex)
        this.groupStart += groupCount;
    }

    checkVoxel(pos){
        if(pos.y < 0 || pos.y >= ChunkHeight) return true
        let blockID;
        if(pos.x < 0 || pos.x >= ChunkSize || pos.z < 0 || pos.z >= ChunkSize) {
            pos.x += this.x * ChunkSize
            pos.z += this.y * ChunkSize

            blockID = this.world.getVoxel(pos)
        }else blockID = this.data[pos.x][pos.y][pos.z]

        if(blockID === 0) return false
        return this.register.getBlockData(blockID).solid
    }

    unload(){
        this.enabled = false;
        this.mesh.visible = false;
    }

    load(){
        this.enabled = true;
        this.mesh.visible = true;
    }

    rebuild(){
        this.vertices = []
        this.UVs = []
        this.geometry.clearGroups()
        this.groupStart = 0
        
        this.createMeshData(true)
        this.createMesh(true)
    }

    removeVoxel(pos, dir){
        pos.x = Math.floor(pos.x) - Math.max(dir.x, 0)
        pos.y = Math.floor(pos.y) - Math.max(dir.y, 0)
        pos.z = Math.floor(pos.z) - Math.max(dir.z, 0)

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.data[pos.x][pos.y][pos.z] = this.register.blockMap.get('air')
    }

    addVoxel(pos, dir, blockID){
        pos.x = Math.floor(pos.x) + Math.min(dir.x, 0)
        pos.y = Math.floor(pos.y) + Math.min(dir.y, 0)
        pos.z = Math.floor(pos.z) + Math.min(dir.z, 0)

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.data[pos.x][pos.y][pos.z] = blockID//possible out of bounds on borders
    }
}