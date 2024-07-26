
export default class Biome {

    constructor(key){
        this.key = key
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