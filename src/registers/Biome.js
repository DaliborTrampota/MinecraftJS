
export default class Biome {

    constructor(name){
        this.name = name
    }

    setTemperature(n){
        this.t = n
        return this
    }

    setHumidity(n){
        this.h = n
        return this
    }

    setAltitude(n){
        this.a = n
        return this
    }
}