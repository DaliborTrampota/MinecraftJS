import { Vector2, Vector3 } from 'three';
import { WORLD_SETTINGS, CrossCheck, Material } from "../../tools/Constants.js"
import { PosMap, create3DArray, map } from "../../tools/Utils.js"
import ItemEntity from "../entities/ItemEntity.js";
import LootTable from "../LootTable.js";
import TerrainBuilder from "./TerrainBuilder.js";

const { chunkSize, chunkHeight } = WORLD_SETTINGS

export default class Chunk {

    constructor(x, y, world){
        this.x = x
        this.y = y
        this.id = Chunk.id(x, y)
        
        this.world = world

        this.data = []
        this.metadata = {}
        this.entities = {}
        this.blockEntities = new PosMap()
        
        this.enabled = false
        this.needsUpdate = false

        this.breaking = []

        this.Init()
        this.builder = new TerrainBuilder(this)
        this.mesh
    }

    get register(){
        return this.world.register;
    }

    Init(){
        this.data = create3DArray(chunkSize, chunkHeight, chunkSize);
        this.populate();
    }

    generate(){
        this.mesh = this.builder.build(new Vector2(this.x, this.y), this.enabled)
        return this.mesh
    }

    populate(){
        //let height = Math.floor(this.world.noise.Get(i + this.x * chunkSize, 0.0, k + this.y * chunkSize)) + 20            
        for(let i = 0; i < chunkSize; ++i){
            for(let j = 0; j < chunkHeight; ++j){
                for(let k = 0; k < chunkSize; ++k){
                    this.data[i][j][k] = this.world.getVoxel(new Vector3(i + this.x * chunkSize, j, k + this.y * chunkSize))
                }
            }
        }
    }

    getBlockState(pos) {
        return this.metadata[`${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`]
    }

    /**
    * @returns true if should render the face
    */
    checkVoxel(pos, blockData, side){
        if(pos.y < 0 || pos.y >= chunkHeight) return true

        let block;
        if(pos.x < 0 || pos.x >= chunkSize || pos.z < 0 || pos.z >= chunkSize) {//outside chunk
            pos.x += this.x * chunkSize
            pos.z += this.y * chunkSize
            block = this.world.getVoxelFromPos(pos)
        }else {
            block = this.getVoxel(pos)
        }

        if(block.voxel) {//TODO culling here?
            return true
            //this works when the voxel model side is full square, doesnt work for example from side of stairs
            // let oppositeSide = getOppositeSide(side)
            // let blockState = this.getBlockState(pos)
            // let rotatedSide = blockState ? VoxelBuilder.rotateSide(oppositeSide, blockState.angle, blockState.rotationAxis) : oppositeSide
            // return !block.vertices[rotatedSide].every(d => d.cullface)
        }
        if(block.material == Material.AIR) return true
        if(block.material == Material.LIQUID) return blockData.id != block.id
        if(block.transparent) return blockData.id != block.id
        return false
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
        this.mesh = this.builder.rebuild()
    }

    rebuildNeighbourChunks(pos, worldPos){
        this.needsUpdate = true
        if(pos.x == 0 || pos.x == chunkSize - 1 || pos.z == 0 || pos.z == chunkSize - 1){
            for(let dir of CrossCheck){
                let chunk = this.world.getChunkFromPos(worldPos.clone().add(dir))
                if(Chunk.equals(chunk, this)) continue
                chunk.needsUpdate = true
            }
        }
    }

    breakVoxel(pos, damage){
        pos.floor()

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        let idx = this.breaking.findIndex(o => o.pos.equals(pos))
        if(idx != -1) {
            this.breaking[idx].hitpoints -= damage
            this.breaking[idx].progress = Math.floor(map(this.breaking[idx].hitpoints, 0, 1000, 9, 0))
            
            if(this.breaking[idx].progress === 10){
                return this.removeVoxel(worldPos, true)
            }
        } else {
            this.breaking.push({ pos, progress: 0, hitpoints: 1000 - damage, time: Date.now() })
        }
        
        this.needsUpdate = true
        this.rebuildNeighbourChunks(pos, worldPos)
    }

    removeVoxel(pos, drop){
        pos.floor()

        let worldPos = pos.clone()

        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z
        
        let curBlock = this.getVoxel(pos)
        if(curBlock.material == Material.AIR) return false

        
        let idx = this.breaking.findIndex(o => o.pos.equals(pos))
        if(idx != -1)
            this.breaking.splice(idx, 1)

        if(drop){
            //todo get drop from loot table, returns itemStack[]
            const table = new LootTable(curBlock.name, { register: window.game.register })
            let drops = table.roll()
            //console.log(table, drops)
            for(let stack of drops){//Todo sound particles
                let entity = new ItemEntity(this.world, stack.item.getModel(worldPos.add(new Vector3(0.5, 0.5, 0.5))), stack, Vector3.Up.multiplyScalar(2))
                window.game.addUpdateSub(entity)
            }
        }
        
        this.setVoxel(pos, this.register.getBlockID('air'))
        delete this.metadata[`${pos.x}_${pos.y}_${pos.z}`]
        this.rebuildNeighbourChunks(pos, worldPos)
        return true
    }

    setVoxel(pos, blockID){
        this.data[pos.x][pos.y][pos.z] = blockID
    }

    addVoxel(pos, blockID, blockData){
        pos.floor()

        let worldPos = pos.clone()
        
        pos.x -= this.mesh.position.x
        pos.z -= this.mesh.position.z

        this.setVoxel(pos, blockID)//possible out of bounds on borders
        if(blockData) {
            this.metadata[blockData.id] = blockData
        }
        this.rebuildNeighbourChunks(pos, worldPos)
        return true
    }

    getVoxel(pos){
        let blockID = this.data[pos.x][pos.y][pos.z]
        if(!blockID && blockID != 0) {
            return false
        }
        return this.register.getBlock(blockID)
    }

    setEntityAt(pos, entity){
        this.blockEntities.set(pos, entity)
    }

    getEntityAt(pos) {
        console.log(this.blockEntities, pos)
        return this.blockEntities.get(pos)
    } 


    // spawnBlock(blockID){
    //     if(blockID <= 0) return false //update to next stage?
    //     const geometry = new BufferGeometry()
    
    //     let blockData = this.register.getBlock(blockID)
    //     let groupStart = 0
    
    //     let verts = [], uvs = []
    //     for(let side in UVs){
    //         let textureIndex = blockData.textures.all ? this.register.textureMap.get(blockData.textures.all) : this.register.textureMap.get(blockData.textures[side])
    //         let groupCount = 0;
    //         for(let vert of triangles[side]){
    //             verts.push(vertices[vert].x + 1)
    //             verts.push(vertices[vert].y + 0)
    //             verts.push(vertices[vert].z + 1)
    //         }
    //         uvs.push(...UVs[side])
    //         groupCount += 6;
            
    //         if(overlayBlockData) {
    //             console.log(overlayBlockData.textures[side] || overlayBlockData.textures.all)
    //             let overlayTextureIndex = this.register.textureMap.get(overlayBlockData.textures[side] || overlayBlockData.textures.all)
    //             geometry.addGroup(groupStart, groupCount, overlayTextureIndex)
    //         }
    //         geometry.addGroup(groupStart, groupCount, textureIndex)
    
    //         groupStart += groupCount;
    //     }

    //     geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
    //     geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
        
    //     return new Mesh(geometry, this.register.textures)
    // }

    
    static equals(c1, c2){
        return c1.x == c2.x && c1.y == c2.y
    }

    toChunkPosition(position){
        position.x -= this.mesh.position.x
        position.z -= this.mesh.position.z
        
        return position
    }

    toWorldPosition(pos) { 
        pos.x += this.x * chunkSize
        pos.z += this.y * chunkSize
        pos.x = Math.floor(pos.x)
        pos.z = Math.floor(pos.z)
        
        return pos
    } 

    toString(){
        return `X: ${this.x} Y: ${this.y}`
    }

    static id(x, y){
        return `${x}_${y}`
    }

}