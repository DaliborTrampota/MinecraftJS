import { Vector3, MathUtils } from 'https://cdn.skypack.dev/three@0.141.0';

export default class AABB {

    constructor(x1, y1, z1, x2, y2, z2) {
        this.xMin = Math.min(x1, x2)
        this.yMin = Math.min(y1, y2)
        this.zMin = Math.min(z1, z2)
        this.xMax = Math.max(x1, x2)
        this.yMax = Math.max(y1, y2)
        this.zMax = Math.max(z1, z2)
    }

    static createVoxelAABBs(block, pos) {
        const AABBs = []
        for(let e of block.elements) {
            AABBs.push(AABB.fromElement(e).move(pos))
        }
        return AABBs
    }

    static fromElement(e) {
        return new AABB(...e.from.map(v => v/16), ...e.to.map(v => v/16))
    }

    static fromBlock(block, pos) {
        if(block.voxel) return AABB.createVoxelAABBs(block, pos)
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

        if(Math.abs(dir.y) > 1) 
            return new Vector3(0, dir.y, 0)

        if(Math.abs(dir.x) > Math.abs(dir.z))
            return new Vector3(Math.sign(dir.x), 0, 0)
        
        return new Vector3(0, 0, Math.sign(dir.z))
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
}