
/**
 * @class Register
 * @abstract
 */
export default class AbstractRegister {

    static INSTANCE
    static ID = 0

    constructor() {
        this.map = new Map()
    }

    static init(){}

    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
        }
        return this.INSTANCE
    }

    static register(name, registerable) {
        console.error('This method must be overridden')
        return this
    }

    static get(key) {
        if(key == null || key == undefined) {
            console.error('No key provided')
            return null
        }
        if(typeof key == 'object') 
            console.error('not a string or number', key)

        if(typeof key == 'number') 
            return this[this.new().map.get(key).toUpperCase()]
        return this[key.toUpperCase()]
    }

    static getID(key) {
        if(key == null || key == undefined) {
            console.error('No key provided')
            return null
        }
        if(typeof key == 'object') 
            console.error('not a string or number', key)
            
        return this[key.toUpperCase()].id
    }

    static all(keys = false) {
        const map = this.new().map
        if(keys) return [...map.values()]
        return Array.from(map, ([k, v]) => {
            let t = this[v.toUpperCase()]
            if(!t) console.warn('No item found for', v)
            return t
        }).filter(r => r)
    }
}