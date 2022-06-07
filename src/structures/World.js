import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { ChunkHeight, ChunkSize, WORLD_SETTINGS } from "../tools/Constants.js";
import Chunk from "./Chunk.js"

export default class World {
    constructor(generator, register, player){
        this.generator = generator
        this.register = register;
        this.player = player;

        this.gravity = -9.81 * 2
        this.chunks = {}

        this.activeChunks = []

        this.Init()
    }

    async Init(){
        console.time('Loading')
        console.info('Loading chunks...')
        await this.load()
        
        console.info('Spawning player...')
        this.spawnPlayer()
        console.timeEnd('Loading')
    }

    Update(delta){
        for(let chID of this.activeChunks){
            let ch = this.chunks[chID]
            if(ch.needsUpdate) {
                ch.rebuild()
                ch.needsUpdate = false
            }
        }
    }

    async load(){
        const start = -this.player.viewDistance
        const end = this.player.viewDistance

        console.log(start, end)

        for(let i = start; i < end; ++i){
            for(let j = start; j < end; ++j){
                console.log(i, j)
                let chunk = new Chunk(i, j, this)
                window.scene.add(chunk.generate())
                chunk.load()

                this.chunks[chunk.id] = chunk
                this.activeChunks.push(chunk.id)
            }
        }
    }

    spawnPlayer(){
        this.player.position.set(ChunkSize / 2, ChunkHeight - 80, ChunkSize / 2)
        this.player.camera.lookAt(ChunkSize / 2, 0, ChunkSize / 2)
    }
    
    getChunk(x, y){
        return this.chunks[Chunk.id(x, y)]
    }

    updateViewDistance(){
        console.log('updating view distance')
        for(let chID of this.activeChunks){//todo unload only necessarry chunks
            this.chunks[chID].unload()
        }
        this.activeChunks = []

        const start = this.player.chunkCoords.x - this.player.viewDistance
        const end = this.player.chunkCoords.y + this.player.viewDistance + 1

        for(let i = start; i < end; ++i){
            for(let j = start; j < end; ++j){
                const ID = Chunk.id(i, j)

                if(!this.chunks[ID]) this.chunks[ID] = new Chunk(i, j, this);
                if(!this.chunks[ID].mesh) window.scene.add(this.chunks[ID].generate())

                this.chunks[ID].load()
                this.activeChunks.push(ID)
            }
        }
    }

    getChunkFromPos(pos){
        let x = Math.floor(pos.x / ChunkSize);
        let y = Math.floor(pos.z / ChunkSize);

        return this.chunks[Chunk.id(x, y)]
    }

    getVoxel(pos){ //Terain Generation here
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
            let chunk = this.chunks[Chunk.id(x, z)]

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