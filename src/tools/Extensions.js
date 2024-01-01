import { Vector3 } from "three";

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