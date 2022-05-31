
import NoiseGenerator from './Noise.js'

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
    }


    getBiome(x, y){

        let curClimate = {
            temperature: this.temperatureNoise.Get(x, 0, y),
            humidity: this.humidityNoise.Get(x, 0, y),
            altitude: this.altitudeNoise.Get(x, 0, y)
        }
        //console.log(curClimate)
        let biomes = Array.from(this.register.biomes.entries())
        let biomesSorted = biomes.sort((a, b) => this.fitness(curClimate, a[1]) - this.fitness(curClimate, b[1]))
        //console.log(biomesSorted, biomesSorted.map(b => this.fitness(curClimate, b[1])))
        return biomesSorted[0][0]
    }

    fitness(currentClimate, biomeClimate){
        let temperature = Math.pow(biomeClimate.t - currentClimate.temperature, 2)
        let humidity = Math.pow(biomeClimate.h - currentClimate.humidity, 2)
        let altitude = Math.pow(biomeClimate.a - currentClimate.altitude, 2)
        //(this.weirdness - d.weirdness) * (this.weirdness - d.weirdness) + (this.offset - d.offset) * (this.offset - d.offset);
        return temperature + humidity + altitude;
    }



}