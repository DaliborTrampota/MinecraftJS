import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { MATERIAL } from '../../tools/Constants.js';


export default class Context {

    constructor(player){
        this.player = player
    }


    getAimedBlock(range = 20, options = { ignoreLiquids: true, placeOnAir: false }){
        options.ignoreLiquids ??= true
        options.placeOnAir ??= false
        
        function getBlockAt(pos, world){
            return world.getVoxelFromPos(pos.clone())
        }

        const dirLen = 0.05
        let dir = this.player.camera.getWorldDirection(new Vector3()).setLength(dirLen)
        
        let position = this.player.camera.getWorldPosition(new Vector3())
        let prevPos = new Vector3()
        let block = getBlockAt(position, this.player.world)
        let totalDistance = 0

        while((options.ignoreLiquids && block.material == MATERIAL.LIQUID) || block.material == MATERIAL.AIR){
            prevPos = position.clone()
            block = getBlockAt(position.add(dir), this.player.world)
            totalDistance += dirLen
            if(totalDistance >= range) break
        }

        if(block.material == MATERIAL.AIR && !options.placeOnAir) return { found: false }

        return { block, position, normal: position.clone().floor().sub(prevPos.floor()), found: true }
    }

}