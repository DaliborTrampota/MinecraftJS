import Features from '../../registers/Features.js'
import Biome from './Biome.js'

export default class OverworldBiomes {
    
    static forest() {
        return new Biome('forest').setTemperature(0.5).setHumidity(0.35).setAltitude(0.5)
            .addFeature(Features.TREE, 0.02)
            .addFeature(Features.POND, 0.005)
    } 

    static desert() {
        return new Biome('desert').setTemperature(0.9).setHumidity(0.15).setAltitude(0.3)
            .addFeature(Features.POND, 0.002)
    }

    static hills() {
        return new Biome('hills').setTemperature(0.2).setHumidity(0.6).setAltitude(0.9)
    }

    static plains() {
        return new Biome('plains').setTemperature(0.5).setHumidity(0.5).setAltitude(0.5)
            .addFeature(Features.TREE, 0.005)
            .addFeature(Features.POND, 0.01)
    }

    static taiga() {
        return new Biome('taiga').setTemperature(0.25).setHumidity(0.8).setAltitude(0.5)
    }

    static snowy() {
        return new Biome('snowy').setTemperature(0).setHumidity(0.9).setAltitude(0.5)
    }

    static swamp() {
        return new Biome('swamp').setTemperature(0.8).setHumidity(0.9).setAltitude(0.5)
    }

    static jungle() {
        return new Biome('jungle').setTemperature(0.95).setHumidity(0.9).setAltitude(0.5)
    }

    static badlands() {
        return new Biome('badlands').setTemperature(2).setHumidity(0).setAltitude(0.5)
    }

    static ocean() {
        return new Biome('ocean')
    }
}