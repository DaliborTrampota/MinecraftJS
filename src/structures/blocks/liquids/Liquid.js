import { Vector3 } from 'three'
import BlockState from '../BlockState.js'
import { CrossCheck, Material } from '../../../tools/Constants.js'
import Block from '../Block.js'



export default class Liquid extends Block {

    constructor(key, spreadDist, canReplicate = true){
        super(key, Material.LIQUID)
        
        this.canReplicate = canReplicate
        this.spreadDist = spreadDist
        this.flowDirection = Vector3.Up.negate()
        
        this.baseKey = key.split('_')[0]
    }

    setFlowDirection(dir) {
        this.flowDirection = dir
        return this
    }

    
    getState(ctx) {
        return new BlockState(
            ctx.hitResult.position.floor(), 
            ctx.block, 
            undefined, 
            { liquidLevel: this.spreadDist, updateLiquid: true }
        )
    }

    
    /**
     * 
     * @param {import('../../level/World.js').default} world 
     * @param {import('./BlockState.js').default} state 
     * @returns {boolean|Array<BlockState>} true if the block and state should be removed
     */
    update(world, state) {
        let waterLevel = state.get('liquidLevel')
        state.set('updateLiquid', false)
        if(waterLevel == 0) return true

        let newPos = state.pos.clone()
        if(Liquid.checkBlock(world, newPos.add(this.flowDirection))) {
            if(newPos.y < 0 || newPos.y >= world.chunkHeight) {
                state.set('liquidLevel', 0)
                return false
            }
            return this.spread(world, newPos, this.spreadDist - 1)
        }

        for(let side of CrossCheck) {
            newPos = state.pos.clone().add(side)
            if(!Liquid.checkBlock(world, newPos)) continue

            this.spread(world, newPos, waterLevel - 1)


            // let curLevel = blockState.get('waterLevel') ?? 0
            // if(curLevel == 8) continue

            // const spread = Math.min(maxSpread, maxLevel - curLevel, waterLevel)
            // curLevel += spread
            // waterLevel -= spread
            
        }
        return false//waterLevel == 0
    }


    spread(world, pos, level) {
        if(level == 0) return

        let blockState = world.getBlockState(pos) 
        const curLevel = blockState?.get('liquidLevel') ?? 0

        if(this.canReplicate && level == this.spreadDist - 1 && curLevel == this.spreadDist - 1) // creating water sources
            level = this.spreadDist 

        if(curLevel >= level || (blockState && blockState.block.baseKey !== this.baseKey)) return

        const block = level == this.spreadDist 
            ? world.register.getBlock(this.baseKey + '_still') 
            : world.register.getBlock(this.baseKey + '_flow')

        blockState ??= new BlockState(pos.clone(), block)
        
        blockState.set('liquidLevel', level)
        blockState.set('updateLiquid', true)
        
        
        const chunk = world.getChunkFromPos(pos)
        chunk.addVoxel(pos, block.id, blockState)
    }

    static checkBlock(world, pos) {
        const block = world.getVoxelFromPos(pos)
        return block.material == Material.AIR || block.material == Material.LIQUID       
    }

    static create(key, spreadDist, canReplicate = true) {
        return [
            new Liquid(key + '_still', spreadDist, canReplicate),
            new Liquid(key + '_flow', spreadDist, canReplicate)
        ]
    }
}