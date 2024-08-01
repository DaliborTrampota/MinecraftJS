import { Vector3 } from "three"
import Feature from "./Feature"
import Palette from "./Palette"

export default class SkyBlockGenerator {

    constructor(register) {
        this.register = register
    }

    getVoxel(pos, world) {
        if (pos.x == 8 && pos.y == 50 && pos.z == 8) {
            // Feature.box(world, new Vector3(5, 47, 5), new Vector3(8, 50, 11), Palette.solid(this.register.getBlock('dirt')))
            // Feature.box(world, new Vector3(8, 47, 5), new Vector3(11, 50, 8), Palette.solid(this.register.getBlock('dirt')))
            
            return this.register.getBlockID('sand')
        }
        return this.register.getBlockID('air')
    }

    getFeature(world, pos) {
        console.log(pos)
        if (pos.x == 8 && pos.y == 50 && pos.z == 8) {
            Feature.box(world, new Vector3(5, 47, 5), new Vector3(8, 50, 11), Palette.solid(this.register.getBlock('dirt')))
            Feature.box(world, new Vector3(8, 47, 5), new Vector3(11, 50, 8), Palette.solid(this.register.getBlock('dirt')))
    
            Feature.box(world, new Vector3(5, 50, 5), new Vector3(8, 51, 11), Palette.solid(this.register.getBlock('grass_block')))
            Feature.box(world, new Vector3(8, 50, 5), new Vector3(11, 51, 8), Palette.solid(this.register.getBlock('grass_block')))
        }
    }
}