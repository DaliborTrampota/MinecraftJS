import { WORLD_SETTINGS } from "../tools/Constants.js";
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
        window.game.addUpdateSub(this)
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

        for(let i = start; i < end; ++i){
            for(let j = start; j < end; ++j){
                let chunk = new Chunk(i, j, this)
                window.scene.add(chunk.generate())
                chunk.load()

                this.chunks[chunk.id] = chunk
                this.activeChunks.push(chunk.id)
            }
        }
    }

    spawnPlayer(){
        this.player.position.set(WORLD_SETTINGS.chunkSize / 2, WORLD_SETTINGS.chunkHeight - 60, WORLD_SETTINGS.chunkSize / 2)
        this.player.camera.lookAt(WORLD_SETTINGS.chunkSize / 2, 0, WORLD_SETTINGS.chunkSize / 2)
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

    getChunk(x, y){
        return this.chunks[Chunk.id(x, y)]
    }

    getChunkFromPos(pos){
        let x = Math.floor(pos.x / WORLD_SETTINGS.chunkSize);
        let y = Math.floor(pos.z / WORLD_SETTINGS.chunkSize);

        return this.chunks[Chunk.id(x, y)]
    }

    getVoxel(pos){ //Terain Generation here
        let height = Math.floor(this.generator.getHeight(pos.x, pos.z))
        
        if(pos.y == height) {
            let biome = this.generator.getBiome(pos.x, pos.z)
            switch(biome.key){
                case 'forest':
                    return this.register.getBlockID('grass_block')
                case 'hills':
                    return this.register.getBlockID('stone')
                case 'desert':
                    return this.register.getBlockID('sand')
            }
            //console.log(biome)
            if(biome > 5) return this.register.getBlockID('sand')
            if(biome > 2) return this.register.getBlockID('gravel')
            return this.register.getBlockID('grass_block')
        }
        else if(pos.y < height && pos.y > height - 3) return this.register.getBlockID('dirt')
        else if(pos.y < height) return this.register.getBlockID('stone')
        
        else if(pos.y <= WORLD_SETTINGS.globalSeaLevel) return this.register.getBlockID('water_still')
        else return this.register.getBlockID('air')
        
    }

    getVoxelFromPos(pos){
        let x = Math.floor(pos.x / WORLD_SETTINGS.chunkSize);
        let y = Math.floor(pos.y);
        let z = Math.floor(pos.z / WORLD_SETTINGS.chunkSize);

        try{
            const chunk = this.chunks[Chunk.id(x, z)]
            if(!chunk) return this.register.getBlock(this.getVoxel(pos))

            x = Math.floor(pos.x - (x * WORLD_SETTINGS.chunkSize))
            z = Math.floor(pos.z - (z * WORLD_SETTINGS.chunkSize))
            return this.register.getBlock(chunk.data[x][y][z])
        } catch(err) {
            //out of building area
            //console.log(err, this.register.getBlock(0))
            return this.register.getBlock(0)
        }
    }

    checkVoxel(pos){
        let block = this.getVoxelFromPos(pos)
        //console.log(pos, block ? block : false)
        if(block) return block.solid
        return false
    }

    getEntityAt(pos) {
        const chunk = this.getChunkFromPos(pos)
        return chunk.getEntityAt(pos)
    }

    setEntityAt(pos, entity){
        const chunk = this.getChunkFromPos(pos)
        return chunk.setEntityAt(pos, entity)
    }

    getBlockState(pos){
        const chunk = this.getChunkFromPos(pos)
        return chunk.getBlockState(pos)
    }
}