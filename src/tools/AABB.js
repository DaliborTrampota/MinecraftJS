import { Vector3, MathUtils } from 'https://cdn.skypack.dev/three@0.141.0'

export default class AABB {

    constructor(x1, y1, z1, x2, y2, z2) {
        this.xMin = Math.min(x1, x2)
        this.yMin = Math.min(y1, y2)
        this.zMin = Math.min(z1, z2)
        this.xMax = Math.max(x1, x2)
        this.yMax = Math.max(y1, y2)
        this.zMax = Math.max(z1, z2)
    }

    get width() {
        return this.xMax - this.xMin
    }

    get height() {
        return this.yMax - this.yMin
    }

    get depth() {
        return this.zMax - this.zMin
    }

    static createVoxelAABBs(block, pos) {
        const AABBs = []
        for (let e of block.elements) {
            AABBs.push(AABB.fromElement(e).move(pos))
        }
        return AABBs
    }

    static fromElement(e) {
        return new AABB(...e.from.map(v => v / 16), ...e.to.map(v => v / 16))
    }

    static fromBlock(block, pos) {
        if (block.voxel) return AABB.createVoxelAABBs(block, pos)
        return [new AABB(0, 0, 0, 1, 1, 1).move(pos)]
    }

    static fromVectors(min, max) {
        return new AABB(min.x, min.y, min.z, max.x, max.y, max.z)
    }

    intersects(aabb) {
        return this.xMin < aabb.xMax && this.xMax > aabb.xMin && this.yMin < aabb.yMax && this.yMax > aabb.yMin && this.zMin < aabb.zMax && this.zMax > aabb.zMin
    }

    contains(x, y, z) {
        return x >= this.xMin && x < this.xMax && y >= this.yMin && y < this.yMax && z >= this.zMin && z < this.zMax
    }

    // https://gamedev.net/forums/topic/696824-two-3d-cubes-in-collisionaabb-how-to-check-which-faces-are-colliding/5379156/
    // Subtract the center of each AABB so you have a vector pointing from shape A to shape B. 
    // Then look at the components of this vector. 
    // The component with the largest absolute can represent two faces, one on each AABB. 
    // On shape A, the face will be the one with the normal pointing in the same direction as the signed value of said component.
    // On shape B, the face will be one pointing in exactly the opposite direction.

    collide(aabb) {
        const dir = this.center().sub(aabb.center())

        return {
            collision: dir,
            direction: this.direction(aabb)
        }
    }

    direction(aabb) {
        const dir = this.center().sub(aabb.center())

        if (Math.abs(dir.y) > 1)
            return new Vector3(0, dir.y, 0)

        if (Math.abs(dir.x) > Math.abs(dir.z))
            return new Vector3(Math.sign(dir.x), 0, 0)

        return new Vector3(0, 0, Math.sign(dir.z))
    }

    expand(val) {
        this.xMin -= val
        this.yMin -= val
        this.zMin -= val
        this.xMax += val
        this.yMax += val
        this.zMax += val
        return this
    }

    center() {
        return new Vector3(
            MathUtils.lerp(this.xMin, this.xMax, 0.5),
            MathUtils.lerp(this.yMin, this.yMax, 0.5),
            MathUtils.lerp(this.zMin, this.zMax, 0.5)
        )
    }

    move(coords) {
        this.xMin += coords.x
        this.xMax += coords.x

        this.yMin += coords.y
        this.yMax += coords.y

        this.zMin += coords.z
        this.zMax += coords.z

        return this
    }

    copy(aabb) {
        aabb.xMin = this.xMin
        aabb.yMin = this.yMin
        aabb.zMin = this.zMin

        aabb.xMax = this.xMax
        aabb.yMax = this.yMax
        aabb.zMax = this.zMax

        return aabb
    }

    clone() {
        return new AABB(this.xMin, this.yMin, this.zMin, this.xMax, this.yMax, this.zMax)
    }

    getPlanes() {
        return [
            { normal: new Vector3(1, 0, 0), point: new Vector3(this.xMin, this.yMin + this.height / 2, this.zMin + this.depth / 2) },// left
            { normal: new Vector3(-1, 0, 0), point: new Vector3(this.xMax, this.yMin + this.height / 2, this.zMin + this.depth / 2) },// right
            { normal: new Vector3(0, 1, 0), point: new Vector3(this.xMin + this.width / 2, this.yMin, this.zMin + this.depth / 2) },// top
            { normal: new Vector3(0, -1, 0), point: new Vector3(this.xMin + this.width / 2, this.yMax, this.zMin + this.depth / 2) },// bottom
            { normal: new Vector3(0, 0, 1), point: new Vector3(this.xMin + this.width / 2, this.yMin + this.height / 2, this.zMin) },// front
            { normal: new Vector3(0, 0, -1), point: new Vector3(this.xMin + this.width / 2, this.yMin + this.height / 2, this.zMax) }// back
        ]
    }

    static aabbSwept1D(objectBB, otherBB, velocity, axis = "y") {
        let dEntry, dExit
        let entry, exit

        let min = `${axis}Min`
        let max = `${axis}Max`

        if (velocity > 0) {
            dEntry = otherBB[min] - objectBB[max]
            dExit = otherBB[max] - objectBB[min]
        } else {
            dEntry = otherBB[max] - objectBB[min]
            dExit = otherBB[min] - objectBB[max]
        }

        if (velocity == 0) {
            entry = -Infinity
            exit = Infinity
        } else {
            entry = dEntry / velocity
            exit = dExit / velocity
        }

        if (entry > exit || entry < 0 || entry > 1)
            return { time: 1 }

        return { time: entry }
    }


    static aabbSwept(objectBB, otherBB, velocity) {
        let xMin = velocity.x > 0 ? objectBB.xMin : objectBB.xMin + velocity.x
        let yMin = velocity.y > 0 ? objectBB.yMin : objectBB.yMin + velocity.y
        let zMin = velocity.z > 0 ? objectBB.zMin : objectBB.zMin + velocity.z
        
        if(!new AABB(
            xMin, yMin, zMin, 
            xMin + objectBB.width + Math.abs(velocity.x), 
            yMin + objectBB.height + Math.abs(velocity.y),
            zMin + objectBB.depth + Math.abs(velocity.z),
        ).intersects(otherBB)) {
            return { time: 1 }
        }

        let dxEntry, dxExit
        let dyEntry, dyExit
        let dzEntry, dzExit

        if (velocity.x > 0) {
            dxEntry = otherBB.xMin - objectBB.xMax
            dxExit = otherBB.xMax - objectBB.xMin
        } else {
            dxEntry = otherBB.xMax - objectBB.xMin
            dxExit = otherBB.xMin - objectBB.xMax
        }

        if (velocity.y > 0) {
            dyEntry = otherBB.yMin - objectBB.yMax
            dyExit = otherBB.yMax - objectBB.yMin
        } else {
            dyEntry = otherBB.yMax - objectBB.yMin
            dyExit = otherBB.yMin - objectBB.yMax
        }

        if (velocity.z > 0) {
            dzEntry = otherBB.zMin - objectBB.zMax
            dzExit = otherBB.zMax - objectBB.zMin
        } else {
            dzEntry = otherBB.zMax - objectBB.zMin
            dzExit = otherBB.zMin - objectBB.zMax
        }

        let txEntry, txExit
        let tyEntry, tyExit
        let tzEntry, tzExit

        if (velocity.x == 0) {
            txEntry = -Infinity
            txExit = Infinity
        } else { 
            txEntry = dxEntry / velocity.x
            txExit = dxExit / velocity.x
        }

        if (velocity.y == 0) {
            tyEntry = -Infinity
            tyExit = Infinity
        } else {
            tyEntry = dyEntry / velocity.y
            tyExit = dyExit / velocity.y
        }

        if (velocity.z == 0) {
            tzEntry = -Infinity
            tzExit = Infinity
        } else {
            tzEntry = dzEntry / velocity.z
            tzExit = dzExit / velocity.z
        }

        let entryTime = Math.max(txEntry, tyEntry, tzEntry)
        let exitTime = Math.min(txExit, tyExit, tzExit)
        
        if (entryTime > exitTime || (txEntry < 0 && tyEntry < 0 && tzEntry < 0) || txEntry > 1 || tyEntry > 1 || tzEntry > 1)
            return { time: 1 }

        const dir = new Vector3(0, 0, 0)
        if (entryTime === txEntry) {
            dir.x = velocity.x > 0 ? -1 : 1;
        } else if (entryTime === tyEntry) {
            dir.y = velocity.y > 0 ? -1 : 1;
        } else {
            dir.z = velocity.z > 0 ? -1 : 1;
        }
        
         return { time: entryTime, dir, bb: otherBB }
     }
}