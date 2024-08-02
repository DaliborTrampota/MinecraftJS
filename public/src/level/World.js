import { WORLD_SETTINGS } from "../tools/Constants.js";
import Chunk from "./Chunk.js"

export default class World {
    
    constructor(key, game, generator) {
        this.key = key
        this.generator = generator
        this.game = game

        this.gravity = -9.81 * 2
        this.chunks = {}

        this.activeChunks = []

        // this.Init()
    }

    get register() {
        return this.game.register
    }

    async Init(){
        console.time('Generating world', this.key)
        this.game.dispatchEvent(new CustomEvent('loading', { detail: 'Generating terrain...'}))
        await this.load()
        
        console.timeEnd('Generating world', this.key)
        this.game.addUpdateSub(this)
    }

    spawn(player) {
        player.setWorld(this)

        const centerOfChunk = WORLD_SETTINGS.chunkSize / 2
        const height = this.getChunk(0, 0).heightAt(centerOfChunk, centerOfChunk) + 10
        player.position.set(centerOfChunk, height, centerOfChunk)
        player.camera.lookAt(centerOfChunk, 0, centerOfChunk) //+h-
        player.spawned = true
        window.game.addUpdateSub(player)
    }

    Update(delta){
        for(let chID of this.activeChunks){
            let ch = this.chunks[chID]
            if(ch.needsUpdate) {
                ch.rebuild()
                ch.needsUpdate = false
            }
            ch.tickWater(delta)
        }
    }

    async load(){
        const start = -3//player.viewDistance
        const end = 3//player.viewDistance

        for(let i = start; i < end; ++i){
            for(let j = start; j < end; ++j){
                let chunk = new Chunk(i, j, this)
                this.chunks[chunk.id] = chunk

                this.activeChunks.push(chunk.id)
            }
        }
        this.game.dispatchEvent(new CustomEvent('loading', { detail: 'Generating features...'}))
        for(let chID in this.chunks) {
            const chunk = this.chunks[chID]
            chunk.generateFeatures()
            window.scene.add(chunk.generate())
            chunk.load()
        }
    }

    updateViewDistance(player){
        console.debug('updating view distance')
        for(let chID of this.activeChunks){//todo unload only necessarry chunks
            this.chunks[chID].unload()
        }
        this.activeChunks = []

        const startX = player.chunkCoords.x - player.viewDistance
        const startY = player.chunkCoords.y - player.viewDistance
        const endX = player.chunkCoords.x + player.viewDistance + 1
        const endY = player.chunkCoords.y + player.viewDistance + 1

        let newChunks = []
        for(let i = startX; i < endX; ++i){
            for(let j = startY; j < endY; ++j){
                const ID = Chunk.id(i, j)

                if(!this.chunks[ID]) {
                    this.chunks[ID] = new Chunk(i, j, this);
                    newChunks.push(ID)
                } else {
                    this.chunks[ID].load()
                }
                if(!this.chunks[ID].mesh) window.scene.add(this.chunks[ID].generate())

                this.activeChunks.push(ID)
            }
        }

        for(let chID of newChunks) {
            let chunk = this.chunks[chID]
            // if(!chunk.mesh) {
                chunk.generateFeatures()
                window.scene.add(chunk.generate())
                chunk.load()
            // }
        }
    }

    getChunk(x, y){
        return this.chunks[Chunk.id(x, y)]
    }

    getChunkFromPos(pos){
        let x = Math.floor(pos.x / WORLD_SETTINGS.chunkSize);
        let y = Math.floor(pos.z / WORLD_SETTINGS.chunkSize);
        // console.log(x, y, pos)

        return this.chunks[Chunk.id(x, y)]
    }

    getVoxel(pos){ //Terain Generation here
        return this.generator.getVoxel(pos, this)
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


    setVoxel(pos, blockID, blockData) {
        const chunk = this.getChunkFromPos(pos)
        if(!chunk) return //console.log(pos.x / WORLD_SETTINGS.chunkSize, pos.z / WORLD_SETTINGS.chunkSize, "Chunk not found")
        return chunk.setVoxel(pos, blockID, blockData)
    }

    addVoxel(pos, blockID, blockData) {
        const chunk = this.getChunkFromPos(pos)
        return chunk.addVoxel(pos, blockID, blockData)
    }
}