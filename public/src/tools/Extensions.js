import { Vector3 } from "three";

const Zero = new Vector3(0, 0, 0)
const North = new Vector3(0, 0, 1)
const Up = new Vector3(0, 1, 0)
const East = new Vector3(1, 0, 0)

Object.defineProperty(Vector3, 'Zero', {
    get: function() {
        return new Vector3(0, 0, 0)
    },
})

Object.defineProperty(Vector3, 'North', {
    get: function() {
        return new Vector3(0, 0, 1)
    }
})

Object.defineProperty(Vector3, 'Up', {
    get: function() {
        return new Vector3(0, 1, 0)
    },
})

Object.defineProperty(Vector3, 'East', {
    get: function() {
        return new Vector3(1, 0, 0)
    }
})

Object.defineProperty(Vector3, 'ZeroC', { value: Zero })
Object.defineProperty(Vector3, 'NorthC', { value: North })
Object.defineProperty(Vector3, 'UpC', { value: Up })
Object.defineProperty(Vector3, 'EastC', { value: East })

Array.prototype.view = function(start, end) {
    return new Proxy(this, {
        get(target, prop) {
            if(prop == 'view') return target.slice(start, end)
            if(prop === 'length') return end - start
            if(isNaN(prop)) return Reflect.get(...arguments)
            return target[start + Number(prop)]
        },
        set(target, prop, value) {
            if(isNaN(prop)) return Reflect.set(...arguments)
            target[start + Number(prop)] = value
            return true
        }
    })
}

Array.prototype.findIndexFrom = function(start, callback, wrap = false) {
    for(let i = start; i < this.length; i++) {
        if(callback(this[i], i, this)) return i
    }
    if(wrap) {
        for(let i = 0; i < start; i++) {
            if(callback(this[i], i, this)) return i
        }
    }
    return -1
}