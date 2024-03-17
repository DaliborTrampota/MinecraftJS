import { Vector3 } from "three"


export default class Side {
    static North = 0
    static South = 1
    static Up = 2
    static Down = 3
    static West = 4
    static East = 5

    static All = [Side.North, Side.South, Side.Up, Side.Down, Side.West, Side.East]

    static NameToSide(sideName) {
        return Side[sideName.slice(0, 1).toUpperCase() + sideName.slice(1).toLowerCase()]
    }

    static getDirection(side) {
        switch (side) {
            case Side.North: return new Vector3( 0,  0,  1)
            case Side.South: return new Vector3( 0,  0, -1)
            case Side.Up:    return new Vector3( 0,  1,  0)
            case Side.Down:  return new Vector3( 0, -1,  0)
            case Side.West:  return new Vector3( 1,  0,  0)
            case Side.East:  return new Vector3(-1,  0,  0)
        }
    }

    static faceCheck() {
        return {
            [Side.North]: (v) => v.setComponent(2, v.z + 1),
            [Side.South]: (v) => v.setComponent(2, v.z - 1),
            [Side.Up]:    (v) => v.setComponent(1, v.y + 1),
            [Side.Down]:  (v) => v.setComponent(1, v.y - 1),
            [Side.West]:  (v) => v.setComponent(0, v.x + 1),
            [Side.East]:  (v) => v.setComponent(0, v.x - 1),
        }
    }

    static fromDirection(dir) {
        if (dir.z > 0) return Side.North
        if (dir.z < 0) return Side.South
        if (dir.y > 0) return Side.Up
        if (dir.y < 0) return Side.Down
        if (dir.x > 0) return Side.West
        if (dir.x < 0) return Side.East
    }

    static rotate(side, angle, axis) {
        let newDir = Side.getDirection(side).applyAxisAngle(axis, angle).round()
        return Side.fromDirection(newDir)
    }

    static opposite(side) {
        return this.fromDirection(this.getDirection(side).negate())
    }
}