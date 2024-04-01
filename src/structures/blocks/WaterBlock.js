import { Vector3 } from "three";
import Block from "./Block.js";
import BlockState from "./BlockState.js";
import { CrossCheck, Material } from "../../tools/Constants.js";


export default class WaterBlock extends Block {

    static INSTANCE

    constructor(key, material){
        super(key, material)

        this.spreadDist = 7
        WaterBlock.INSTANCE = this
    }


    /**
     * 
     * @param {import('../level/World.js').default} world 
     * @param {Vector3} pos 
     * @param {import('./BlockState.js').default} state 
     * @returns {boolean|Array<BlockState>} true if the block and state should be removed
     */
    static spread(world, pos, state) {
        let waterLevel = state.get('waterLevel')
        if(waterLevel == 0) return true

        let newPos = pos.clone()
        if(WaterBlock.checkBlock(world, newPos.sub(Vector3.Up))) {
            return WaterBlock.createWater(world, newPos, WaterBlock.INSTANCE.spreadDist)
        }

        for(let side of CrossCheck) {
            newPos = pos.clone().add(side)
            if(!WaterBlock.checkBlock(world, newPos)) continue

            WaterBlock.createWater(world, newPos, waterLevel - 1)


            // let curLevel = blockState.get('waterLevel') ?? 0
            // if(curLevel == 8) continue

            // const spread = Math.min(maxSpread, maxLevel - curLevel, waterLevel)
            // curLevel += spread
            // waterLevel -= spread
            
            // blockState.set('waterLevel', curLevel)
            // const chunk = world.getChunkFromPos(newPos)
            // chunk.addVoxel(newPos, world.register.getBlock('water').id, blockState)
            // newStates.push(blockState)
        }
        // state.set('waterLevel', waterLevel)
        return false//waterLevel == 0
    } 


    static checkBlock(world, pos) {
        let block = world.getVoxelFromPos(pos)
        return block.material == Material.AIR || block.material == Material.LIQUID       
    }

    static createWater(world, pos, level) {
        let blockState = world.getBlockState(pos) ?? new BlockState(pos, WaterBlock.INSTANCE)

        blockState.set('waterLevel', Math.max(blockState.get('waterLevel') ?? 0, level))
        console.log(blockState.get('waterLevel'))
        const chunk = world.getChunkFromPos(pos)
        chunk.addVoxel(pos, world.register.getBlock('water').id, blockState)
    }

    getState(ctx) {
        return new BlockState(ctx.hitResult.position.floor(), ctx.block, undefined, { waterLevel: this.spreadDist })
    }


    getFace(side, culling = false, rawUVs = false, state) {
        let verts = this.unculled.verts[side] ?? []
        let uvs = this.unculled[rawUVs ? 'rawUVs' : 'uvs'][side] ?? []
        
        if(!culling && this.culled.verts[side]) {
            verts = verts.concat(this.culled.verts[side])
            uvs = uvs.concat(this.culled[rawUVs ? 'rawUVs' : 'uvs'][side])
        } else {
            verts = [...verts]
            uvs = [...uvs]
        }
        
        return { verts, uvs, material: this.textureID }
    }
}