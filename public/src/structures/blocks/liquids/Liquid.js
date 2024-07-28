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
            { liquidLevel: this.spreadDist, dirty: true }
        )
    }

    
    /**
     * 
     * @param {import('../../level/World.js').default} world 
     * @param {import('../BlockState.js').default} state 
     * @returns {boolean|Array<BlockState>} true if the block and state should be removed
     */
    update(world, state) {
        let waterLevel = state.get('liquidLevel'), source
        if(source = state.get('source')) {
            if(!(source = world.getBlockState(source))) { // if source is destroyed?
                state.set('liquidLevel', --waterLevel)
            } else {
                state.set('dirty', false)
            } 
        } else {
            source = state
            state.set('dirty', false)
        }

        if(waterLevel == 0) {
            source?.set('flow', source.get('flow').filter(p => p.equals(state.pos)))
            return true
        }

        let newPos = state.pos.clone()
        if(Liquid.checkBlock(world, newPos.add(this.flowDirection))) {
            if(newPos.y < 0 || newPos.y >= world.chunkHeight) {
                state.set('liquidLevel', 0)
                return false
            }
            if(this.spread(world, newPos, this.spreadDist - 1, state.pos.clone())?.set('source', state.get('source') ?? state.pos))
                source?.add('flow', newPos)
            return false
        }

        const holes = this.findHoles(world, state.pos.clone())
        if(holes.length == 0) {
            for(let side of CrossCheck) {
                newPos = state.pos.clone().add(side)
                if(!Liquid.checkBlock(world, newPos)) continue
    
                if(this.spread(world, newPos, waterLevel - 1, state.pos.clone())?.set('source', state.get('source') ?? state.pos))
                    source?.add('flow', newPos)
    
                // let curLevel = blockState.get('waterLevel') ?? 0
                // if(curLevel == 8) continue
    
                // const spread = Math.min(maxSpread, maxLevel - curLevel, waterLevel)
                // curLevel += spread
                // waterLevel -= spread
                
            }
        } else {
            for(let holeDir of holes) {
                newPos = state.pos.clone().add(holeDir)
                if(this.spread(world, newPos, waterLevel - 1, state.pos.clone())?.set('source', state.get('source') ?? state.pos))
                    source?.add('flow', newPos)
                
            }
        }

        return false
    }


    /**
     * Spreads liquid to the given position, creates BlockState and places Block
     * @param {import('../../level/World.js').default} world World instance
     * @param {Vector3} pos Position where to spread the liquid
     * @param {number} level Level of the liquid 
     * @returns {BlockState?} Newly created or already existing BlockState
     */
    spread(world, pos, level, prevPos) {
        if(level == 0) return

        let blockState = world.getBlockState(pos) 
        const curLevel = blockState?.get('liquidLevel') ?? 0

        // if(this.canReplicate && level == this.spreadDist - 1 && curLevel == this.spreadDist - 1) // creating water sources
        //     level = this.spreadDist 

        if(curLevel >= level || (blockState && blockState.block.baseKey !== this.baseKey)) return

        const block = level == this.spreadDist 
            ? world.register.getBlock(this.baseKey + '_still') 
            : world.register.getBlock(this.baseKey + '_flow')

        blockState ??= new BlockState(pos.clone(), block, {
            rotationAxis: Vector3.Up,
            facing: prevPos.sub(pos),
        })
        
        blockState.set('liquidLevel', level)
        blockState.set('dirty', true)
        
        
        const chunk = world.getChunkFromPos(pos)
        chunk.addVoxel(pos, block.id, blockState)

        return blockState
    }

    findHoles(world, pos, radius = 5) {
        let shortest = Infinity
        let holeDirs = []
        
        for(let i = -radius; i <= radius; i++) {
            for(let j = -radius; j <= radius; j++) {
                const tempPos = pos.clone().add(new Vector3(i, 0, j))
                if(!Liquid.checkBlock(world, tempPos)) continue
                if(Liquid.checkBlock(world, tempPos.add(this.flowDirection))) {
                    const dir = tempPos.sub(pos).setY(0)
                    const len = dir.length()
                    if(len < shortest) {
                        holeDirs = [dir]
                        shortest = len
                    } else if(len == shortest) {
                        holeDirs.push(dir)
                    }
                }
            }
        }
        const dirs = []
        for(let dir of holeDirs) {
            for(let i = 0; i < 3; i++) {
                let comp = dir.getComponent(i)
                if(comp != 0) 
                    dirs.push(new Vector3(0, 0, 0).setComponent(i, Math.sign(comp)))
            }
        }
        return dirs
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