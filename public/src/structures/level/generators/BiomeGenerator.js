
import { WORLD_SETTINGS } from '../../tools/Constants.js';
import NoiseGenerator from '../../tools/Noise.js'

export default class BiomeGenerator {
    
    constructor(register){
        this.register = register;

        this.temperatureNoise = new NoiseGenerator({
            seed: 6 + 1,
            octaves: 1,
            scale: 32,
            persistence: 1,
            lacunarity: 2.0,
            exponentiation: 4,
            height: 2,
        })
        this.humidityNoise = new NoiseGenerator({
            seed: 6 + 2,
            octaves: 1,
            scale: 32,
            persistence: 1,
            lacunarity: 2.0,
            exponentiation: 4,
            height: 2,
        })
        this.altitudeNoise = new NoiseGenerator({
            seed: 6 + 3,
            octaves: 1,
            scale: 32,
            persistence: 1,
            lacunarity: 2.0,
            exponentiation: 4,
            height: 2,
        })

        this.heightNoise = new NoiseGenerator({
            seed: 6,
            octaves: 3,
            scale: 64,
            persistence: 0.5,
            lacunarity: 2.0,
            exponentiation: 4,
            height: WORLD_SETTINGS.chunkHeight / 4,
        })
    }

    getHeight(x, y){
        //let height = Math.floor(this.noises.elevation.Get(pos.x, 0, pos.z) + (this.noises.roughness.Get(pos.x + 500, 0, pos.z + 500) * this.noises.detail.Get(pos.x - 500, 0, pos.z - 500)) * 64 + 64)
        return this.heightNoise.Get(x, 0, y) + 10
    }


    getBiome(x, y){
        const curClimate = {
            temperature: this.temperatureNoise.Get(x, 0, y),
            humidity: this.humidityNoise.Get(x, 0, y),
            altitude: this.altitudeNoise.Get(x, 0, y)
        }
        //console.log(curClimate)

        const biomes = Array.from(this.register.biomes.map.values(), key => this.register.getBiome(key))
        const biomesSorted = biomes.sort((a, b) => this.fitness(curClimate, a) - this.fitness(curClimate, b))
        //console.log(biomesSorted, biomesSorted.map(b => this.fitness(curClimate, b[1])))
        return biomesSorted[0]
    }

    fitness(currentClimate, biomeClimate){
        let temperature = Math.pow(biomeClimate.t - currentClimate.temperature, 2)
        let humidity = Math.pow(biomeClimate.h - currentClimate.humidity, 2)
        let altitude = Math.pow(biomeClimate.a - currentClimate.altitude, 2)
        //(this.weirdness - d.weirdness) * (this.weirdness - d.weirdness) + (this.offset - d.offset) * (this.offset - d.offset);
        return temperature + humidity + altitude;
    }



}

/*
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
        }*/