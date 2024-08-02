import { Vector3 } from "three"


export default class Feature {

    constructor(key) {
        this.key = key
        this.operations = []
    }

    place(pallete, blockData = false) {
        this.operations.push((world, pos) => {
            world.setVoxel(pos, pallete.getBlock(), blockData)
        })
        return this
    }

    createLine(start, end, palette, blockData = false) {
        this.operations.push((world, pos) => {
            Feature.line(world, pos.clone().add(start), pos.clone().add(end), palette, blockData)
        })
        return this
    }

    createSphere(center, radius, hollow = false, palette, blockData = false) {
        this.operations.push((world, pos) => {
            Feature.sphere(world, pos.clone().add(center), radius, hollow, palette, blockData)
        })
        return this
    }

    createCone(center, radius, height, palette, blockData = false) {
        this.operations.push((world, pos) => {
            Feature.cone(world, pos.clone().add(center), radius, height, palette, blockData)
        })
        return this
    }

    createBox(start, end, palette, blockData = false) {
        this.operations.push((world, pos) => {
            Feature.box(world, pos.clone().add(start), pos.clone().add(end), palette, blockData)
        })
        return this
    }

    generate(world, pos, updateChunk = true) {
        for(let operation of this.operations) {
            operation(world, pos)
        }
        if(updateChunk) this.updateChunk()
    }
    
    /**
     * 
     * @param {import('../level/World.js').default} world 
     * @param {Vector3} start 
     * @param {Vector3} end 
     * @param {import('./Palette.js').default} palette 
     * @param {import('../blocks/BlockState.js').default} blockData 
     */
    static line(world, start, end, palette, blockData) {
        let dir = end.clone().sub(start)
        let len = dir.length()

        dir.setLength(0.025)
        let curBlockPos = end.clone()
        while(len > 0) {
            if(curBlockPos.equals(start.clone().floor())) {
                len -= 0.025
                start.add(dir)
                continue
            }
            curBlockPos = start.clone().floor()
            world.setVoxel(curBlockPos, palette.getBlock(), blockData)
            
            len -= 0.025
            start.add(dir)
        }
    }

    /**
     * 
     * @param {import('../level/World.js').default} world 
     * @param {Vector3} start 
     * @param {Number} center 
     * @param {Boolean} hollow
     * @param {import('./Palette.js').default} palette 
     * @param {import('../blocks/BlockState.js').default} blockData 
     */
    static sphere(world, center, radius, hollow, palette, blockData = false) {
        let r2 = radius * radius
        for(let x = -radius; x < radius; x++) {
            for(let y = -radius; y < radius; y++) {
                for(let z = -radius; z < radius; z++) {
                    let pos = new Vector3(x, y, z)
                    if(pos.lengthSq() < r2) {
                        if(hollow && pos.clone().sub(center).lengthSq() > (r2 - 1)) continue
                        world.setVoxel(center.clone().add(pos), palette.getBlock(), blockData)
                    }
                }
            }
        }
    }

    static cone(world, center, radius, height, palette, blockData = false) {
        let slope = Math.abs(Math.floor(radius / height))
        let hInc = height > 0 ? 1 : -1
        for(let y = 0; height > 0 ? y < height : y > height; y += hInc) {
            const r2 = (radius - 0.5) * (radius - 0.5)
            for(let x = -radius; x <= radius; x++) {
                for(let z = -radius; z <= radius; z++) {
                    let pos = new Vector3(x, y, z)
                    if((pos.x * pos.x + pos.z * pos.z) < r2) {
                        // if(hollow && pos.clone().sub(center).lengthSq() > (r2 - 1)) continue
                        world.setVoxel(pos.add(center), palette.getBlock(), blockData)
                    }
                }
            }
            radius -= slope
        }
    }

    static box(world, start, end, palette, blockData = false) {
        for(let x = start.x; x < end.x; x++) {
            for(let y = start.y; y < end.y; y++) {
                for(let z = start.z; z < end.z; z++) {
                    world.setVoxel(new Vector3(x, y, z), palette.getBlock(), blockData)
                }
            }
        }
    }

    updateChunk() {
        this.chunk.needsUpdate = true
    }
}

window.Feature = Feature
window.Vector3 = Vector3