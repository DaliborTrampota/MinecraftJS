import { WORLD_SETTINGS } from "../../tools/Constants.js";
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
                this.chunks[chunk.id] = chunk

                window.scene.add(chunk.generate())
                chunk.load()

                this.activeChunks.push(chunk.id)
            }
        }
    }

    spawnPlayer(){
        const centerOfChunk = WORLD_SETTINGS.chunkSize / 2
        const height = this.getChunk(0, 0).heightAt(centerOfChunk, centerOfChunk) + 10
        this.player.position.set(centerOfChunk, height, centerOfChunk)
        this.player.camera.lookAt(centerOfChunk, 0, centerOfChunk) //+h-
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
        return this.generator.getVoxel(pos)
    }

    getVoxelFromPos(pos){
        let x = Math.floor(pos.x / WORLD_SETTINGS.chunkSize);
        let y = Math.floor(pos.y)
        let z = Math.floor(pos.z / WORLD_SETTINGS.chunkSize);

        try{
            const chunk = this.chunks[Chunk.id(x, z)]
            if(!chunk) 
                return this.register.getBlock(this.generator.getVoxel(pos))

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