
export default class Biome {

    constructor(key){
        this.key = key
        this.t
        this.h
        this.a

        this.features = {}
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

    addFeature(feature, chance) {
        this.features[feature.key] = chance
        return this
    }

    getFeature() {
        const random = Math.random()
        for(let feature in this.features) {
            if(random < this.features[feature]) return feature
        }
        return false
    }
}