import { ChunkHeight, ChunkSize, HalfWorldSize, WorldSize, WorldSizeInChunks } from "./Constants.js";
import { Vector3, Vector2, Scene } from 'https://cdn.skypack.dev/three@0.129.0';
import { create2DArray } from "./Utils.js";
import Chunk from "./Chunk.js"

import NoiseGenerator from './Noise.js'
import BiomeGenerator from "./BiomeGenerator.js";


export default class World {
    constructor(game, register, player){
        this.game = game
        this.register = register;
        this.player = player;

        this.chunks = create2DArray(WorldSizeInChunks, WorldSizeInChunks); 

        this.biomeGenerator = new BiomeGenerator(game.register)
        this.noises = {
            elevation: new NoiseGenerator({
                seed: 6,
                octaves: 1,
                scale: 64,
                persistence: 1,
                lacunarity: 2.0,
                exponentiation: 4,
                height: 1,
            }),
            roughness: new NoiseGenerator({
                seed: 6,
                octaves: 1,
                scale: 64,
                persistence: 1,
                lacunarity: 2.0,
                exponentiation: 4,
                height: 1,
            }),
            detail: new NoiseGenerator({
                seed: 6,
                octaves: 1,
                scale: 64,
                persistence: 1,
                lacunarity: 2.0,
                exponentiation: 4,
                height: 1,
            })   
        }
        this.noise = new NoiseGenerator({
            seed: 6,
            octaves: 3,
            scale: 64,
            persistence: 0.5,
            lacunarity: 2.0,
            exponentiation: 4,
            height: ChunkHeight / 4,
        })

        this.activeChunks = []

        this.Init()
    }

    async Init(){
        console.time('Loading')

        //console.log('Generating world...')
        //this.generateWorld()

        //console.log('Drawing world...')
        //this.createChunkMeshes()

        console.log('Loading chunks...')
        await this.load()
        
        console.log('Spawning player...')
        this.spawnPlayer()

        console.timeEnd('Loading')
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
                this.game.Scene.add(this.chunks[i][j].mesh)
            }
        }
    }

    async load(){
        const x = { start:  Math.max(this.player.chunk.x - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunk.x + this.player.viewDistance, WorldSizeInChunks) }
        const y = { start:  Math.max(this.player.chunk.y - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunk.y + this.player.viewDistance, WorldSizeInChunks) }

        for(let i = x.start; i < x.end; ++i){
            for(let j = y.start; j < y.end; ++j){
                if(!this.chunks[i][j]) this.chunks[i][j] = new Chunk(i, j, this);
                if(!this.chunks[i][j].mesh) this.game.Scene.add(this.chunks[i][j].generate())
                this.chunks[i][j].load()
                this.activeChunks.push(new Vector2(i, j))
            }
        }
    }

    spawnPlayer(){
        let xz = HalfWorldSize * ChunkSize + (ChunkSize / 2);
        let y = ChunkHeight
        
        this.player.chunk
        this.player.position = new Vector3(xz, y + 100, xz)
        this.player.camera.lookAt(xz, 0, xz)
    }
    
    getChunk(x, y){
        if(x < 0 || y < 0 || x >= WorldSizeInChunks || y >= WorldSizeInChunks) return false;
        return this.chunks[x][y]
    }

    getVoxel(pos){ //Terain Generation here
        if(pos.x < 0 || pos.x >= WorldSize || pos.z < 0 || pos.z >= WorldSize) return 0
        let height = Math.floor(this.noise.Get(pos.x, 0.0, pos.z)) + 10
        //let height = Math.floor(this.noises.elevation.Get(pos.x, 0, pos.z) + (this.noises.roughness.Get(pos.x + 500, 0, pos.z + 500) * this.noises.detail.Get(pos.x - 500, 0, pos.z - 500)) * 64 + 64)
        //console.log(height)
        if(pos.y == height) {
            let biome = this.biomeGenerator.getBiome(pos.x, pos.z) //this.noise.Get(pos.z, 0.0, pos.x)
            switch(biome){
                case 'forest':
                    return this.register.blockMap.get('grass_block')
                case 'hills':
                    return this.register.blockMap.get('gravel')
                case 'desert':
                    return this.register.blockMap.get('sand')
            }
            //console.log(biome)
            if(biome > 5) return this.register.blockMap.get('sand')
            if(biome > 2) return this.register.blockMap.get('gravel')
            return this.register.blockMap.get('grass_block')
        }
        else if(pos.y < height && pos.y > height - 3) return this.register.blockMap.get('dirt')
        else if(pos.y < height) return this.register.blockMap.get('stone')
        


        else return this.register.blockMap.get('air')
    }

    updateViewDistance(){
        for(let ch of this.activeChunks){
            this.chunks[ch.x][ch.y].unload()
        }
        this.activeChunks = []
        const x = { start:  Math.max(this.player.chunk.x - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunk.x + this.player.viewDistance, WorldSizeInChunks) }
        const y = { start:  Math.max(this.player.chunk.y - this.player.viewDistance + 1, 0), end: Math.min(this.player.chunk.y + this.player.viewDistance, WorldSizeInChunks) }
        for(let i = x.start; i < x.end; ++i){
            for(let j = y.start; j < y.end; ++j){
                if(!this.chunks[i][j]) this.chunks[i][j] = new Chunk(i, j, this);
                if(!this.chunks[i][j].mesh) this.game.Scene.add(this.chunks[i][j].generate())
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

    getVoxelFromPos(pos){
        let x = Math.floor(pos.x / ChunkSize);
        let y = Math.floor(pos.y / ChunkHeight);
        let z = Math.floor(pos.z / ChunkSize);

        let chunk = this.chunks[x][z]

        x = pos.x - (x * ChunkSize)
        z = pos.z - (z * ChunkSize)

        return chunk.data[x][y][z]
    }

}