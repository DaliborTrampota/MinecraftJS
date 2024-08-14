import { Vector2, Vector3 } from "three";
import { BASE_PLAYER_SETTINGS, CornerCheck, CrossCheck, GENERATE_PHASES, WORLD_SETTINGS } from "../tools/Constants.js";
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
        await this.generate(
            new Vector2(-BASE_PLAYER_SETTINGS.viewDistance, -BASE_PLAYER_SETTINGS.viewDistance), 
            new Vector2(BASE_PLAYER_SETTINGS.viewDistance, BASE_PLAYER_SETTINGS.viewDistance), 
            true
        )
        
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


    async generate(from, to, load = false) {
        const generated = []
        for(let i = from.x - 1; i <= to.x + 1; ++i){
            for(let j = from.y - 1; j <= to.y + 1; ++j){
                let chunk = this.getChunk(i, j) ?? new Chunk(i, j, this)
                this.chunks[chunk.id] ??= chunk
                generated.push(chunk)
                // if(chunk = this.getChunk(i, j)) {
                //     if(chunk.generatePhase < GENERATE_PHASES.Features)
                //         generated.push(chunk) 
                //     else {
                //         rest.push(chunk)
                //     }
                // } else {
                //     chunk = new Chunk(i, j, this)
                //     this.chunks[chunk.id] = chunk
                //     generated.push(chunk)
                // }
            }
        }

        this.game.dispatchEvent(new CustomEvent('loading', { detail: 'Generating features...'}))
        for(const ch of generated) {
            if(ch.generatePhase < GENERATE_PHASES.Features) {
                let allNeighbors = true
                for(const dir of [...CornerCheck, ...CrossCheck]) {
                    const neighbor = this.getChunk(ch.x + dir.x, ch.y + dir.z)
                    if(!neighbor) {
                        allNeighbors = false
                        break
                    }
                }
    
                if(allNeighbors) {
                    ch.generateFeatures()
                }
            }

            const inCenter = ch.x >= from.x && ch.x <= to.x && ch.y >= from.y && ch.y <= to.y
            if(load && inCenter  && !this.activeChunks.includes(ch.id)) {
                this.activeChunks.push(ch.id)
                if(!ch.mesh?.parent) window.scene.add(ch.generate())
                ch.load()
            }
        }
        if(load) {
            for(let i = this.activeChunks.length - 1; i >= 0; --i) {
                const chID = this.activeChunks[i]
                const [x, y] = chID.split('_').map(Number)
                if(x < from.x || x > to.x || y < from.y || y > to.y) {
                    this.chunks[chID].unload()
                    this.activeChunks.splice(this.activeChunks.indexOf(chID), 1)
                }
            }
        }
    }

    updateViewDistance(player){
        console.debug('updating view distance')
        this.generate(
            new Vector2(player.chunkCoords.x - player.viewDistance, player.chunkCoords.y - player.viewDistance),
            new Vector2(player.chunkCoords.x + player.viewDistance, player.chunkCoords.y + player.viewDistance),
            true
        )
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