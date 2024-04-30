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