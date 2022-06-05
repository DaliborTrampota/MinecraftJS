import { Vector3, Vector2 } from 'https://cdn.skypack.dev/three@0.141.0';
import { ChunkHeight, ChunkSize, HalfWorldSize, WorldSize, WorldSizeInChunks, WORLD_SETTINGS } from "../tools/Constants.js";
import { create2DArray } from "../tools/Utils.js";
import Chunk from "./Chunk.js"

export default class World {
    constructor(generator, register, player){
        this.generator = generator
        this.register = register;
        this.player = player;

        this.gravity = -9.81 * 2
        this.chunks = create2DArray(WorldSizeInChunks, WorldSizeInChunks)

        this.activeChunks = []

        this.Init()
    }

    async Init(){
        console.time('Loading')

        //console.log('Generating world...')
        //this.generateWorld()

        //console.log('Drawing world...')
        //this.createChunkMeshes()

        console.info('Loading chunks...')
        await this.load()
        
        console.info('Spawning player...')
        this.spawnPlayer()

        console.timeEnd('Loading')
    }

    Update(delta){
        for(let chPos of this.activeChunks){
            let ch = this.chunks[chPos.x][chPos.y]
            if(ch.needsUpdate) {
                ch.rebuild()
                ch.needsUpdate = false
            }
        }
    }

    generateWorld(){
        for(let i = 0; i < WorldSizeInChunks; ++i){
            for(let j = 0; j < WorldSizeInChunks; ++j){
                this.chunks[i][j] = new Chunk(i, j, this)
            }
        }
    }

    createChunkMeshes(){
        for(let i = 0; i < WorldSizeInChunks; ++i){
            for(let j = 0; j < WorldSizeInChunks; ++j){
                this.chunks[i][j].generate()
                window.scene.add(this.chunks[i][j].mesh)
            }
        }
    }

    async load(){
        const x = { start:  Math.max(this.player.chunkCoords.x - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunkCoords.x + this.player.viewDistance, WorldSizeInChunks) }
        const y = { start:  Math.max(this.player.chunkCoords.y - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunkCoords.y + this.player.viewDistance, WorldSizeInChunks) }

        for(let i = x.start; i < x.end; ++i){
            for(let j = y.start; j < y.end; ++j){
                if(!this.chunks[i][j]) this.chunks[i][j] = new Chunk(i, j, this);
                if(!this.chunks[i][j].mesh) window.scene.add(this.chunks[i][j].generate())
                this.chunks[i][j].load()
                this.activeChunks.push(new Vector2(i, j))
            }
        }
    }

    spawnPlayer(){
        let xz = HalfWorldSize * ChunkSize + (ChunkSize / 2);
        let y = ChunkHeight
        
        //this.player.chunk
        this.player.position = new Vector3(xz, y + 20, xz)
        this.player.camera.lookAt(xz, 0, xz)
    }
    
    getChunk(x, y){
        if(x < 0 || y < 0 || x >= WorldSizeInChunks || y >= WorldSizeInChunks) return false;
        return this.chunks[x][y]
    }

    updateViewDistance(){
        for(let ch of this.activeChunks){
            this.chunks[ch.x][ch.y].unload()
        }
        this.activeChunks = []

        const x = { start:  Math.max(this.player.chunkCoords.x - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunkCoords.x + this.player.viewDistance, WorldSizeInChunks) }
        const y = { start:  Math.max(this.player.chunkCoords.y - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunkCoords.y + this.player.viewDistance, WorldSizeInChunks) }

        for(let i = x.start; i < x.end; ++i){
            for(let j = y.start; j < y.end; ++j){
                if(!this.chunks[i][j]) this.chunks[i][j] = new Chunk(i, j, this);
                if(!this.chunks[i][j].mesh) window.scene.add(this.chunks[i][j].generate())
                this.chunks[i][j].load()
                this.activeChunks.push(new Vector2(i, j))
            }
        }
    }

    getChunkFromPos(pos){
        let x = Math.floor(pos.x / ChunkSize);
        let y = Math.floor(pos.z / ChunkSize);
        
        if(x >= WorldSizeInChunks || y >= WorldSizeInChunks || x < 0 || y < 0) return false;

        return this.chunks[x][y]
    }

    getVoxel(pos){ //Terain Generation here
        if(pos.x < 0 || pos.x >= WorldSize || pos.z < 0 || pos.z >= WorldSize) return 0
        let height = Math.floor(this.generator.getHeight(pos.x, pos.z))
        
        if(pos.y == height) {
            let biome = this.generator.getBiome(pos.x, pos.z)
            switch(biome){
                case 'forest':
                    return this.register.blocks.getID('grass_block')
                case 'hills':
                    return this.register.blocks.getID('stone')
                case 'desert':
                    return this.register.blocks.getID('sand')
            }
            //console.log(biome)
            if(biome > 5) return this.register.blocks.getID('sand')
            if(biome > 2) return this.register.blocks.getID('gravel')
            return this.register.blocks.getID('grass_block')
        }
        else if(pos.y < height && pos.y > height - 3) return this.register.blocks.getID('dirt')
        else if(pos.y < height) return this.register.blocks.getID('stone')
        
        else if(pos.y <= WORLD_SETTINGS.globalSeaLevel) return this.register.blocks.getID('water_still')
        else return this.register.blocks.getID('air')
        
    }

    getVoxelFromPos(pos){
        let x = Math.floor(pos.x / ChunkSize);
        let y = Math.floor(pos.y);
        let z = Math.floor(pos.z / ChunkSize);

        try{
            let chunk = this.chunks[x][z]

            x = Math.floor(pos.x - (x * ChunkSize))
            z = Math.floor(pos.z - (z * ChunkSize))

            return this.register.getBlock(chunk.data[x][y][z])
        } catch(err) {
            //out of building area
            //console.log(err, this.register.getBlock(0))
            return this.register.getBlock(0)
        }
    }

    checkVoxel(x, y, z){
        let pos = new Vector3(x, y, z)
        let block = this.getVoxelFromPos(pos)
        //console.log(pos, block ? block : false)
        if(block) return block.solid
        return false
    }

    checkVoxelVec(pos){
        let block = this.getVoxelFromPos(pos)
        //console.log(pos, block ? block : false)
        if(block) return block.solid
        return false
    }

}