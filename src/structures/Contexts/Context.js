import { Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { Material } from '../../tools/Constants.js';
import AABB from '../../tools/AABB.js';


export default class Context {

    constructor(player, stack){
        this.player = player
        this.stack = stack
    }

    get world() {
        return this.player.world
    } 


    getAimedBlock(range = 20, options = { ignoreLiquids: true, placeOnAir: false }){
        options.ignoreLiquids ??= true
        options.placeOnAir ??= false
        
        function getBlockAt(pos, world){
            return world.getVoxelFromPos(pos.clone())
        }

        const dirLen = 0.025
        let dir = this.player.camera.getWorldDirection(new Vector3()).setLength(dirLen)
        
        let position = this.player.camera.getWorldPosition(new Vector3())
        let prevPos = new Vector3()
        let block = getBlockAt(position, this.player.world)
        let totalDistance = 0
        let bb = false

        while((options.ignoreLiquids && block.material == Material.LIQUID) || block.material == Material.AIR){
            bb = false
            prevPos = position.clone()
            block = getBlockAt(position.add(dir), this.player.world)
            if(block.voxel) {
                const bbs = AABB.fromBlock(block, position.clone().floor())
                bb = bbs.find(box => box.contains(...position.toArray()))
                if(!bb) block = { material: Material.AIR } 
            }
            totalDistance += dirLen
            if(totalDistance >= range) break
        }

        if(block.material == Material.AIR && !options.placeOnAir) return { found: false }
        if(block.material == Material.LIQUID && options.ignoreLiquids) return { found: false }

        if(!bb) bb = AABB.fromBlock(block, position.clone().floor())[0]
        const planes = bb.getPlanes()
        const closest = { t: Infinity, normal: undefined }
        dir.normalize()
        for(let plane of planes){
            const t = this.intersectPlane(plane.normal, plane.point.clone(), prevPos, dir)
            if(t >= 0) {
                closest.t = t
                closest.normal = plane.normal
                closest.point = this.getIntersectedPoint(prevPos.clone(), dir.clone(), t)
            }
        }
        const angle = closest.normal.angleTo(dir) * 180 / Math.PI
        return { block, position, normal: closest.normal.clone().negate(), angle, point: closest.point.sub(position.clone().floor()), found: true }
    }

    intersectPlane(n, p0, origin, dir) {
        // assuming vectors are all normalized
        const denom = n.dot(dir)
        if (denom > 1e-6) {
            const diff = p0.sub(origin)
            return diff.dot(n) / denom 
        }

        return -Infinity
    }

    getIntersectedPoint(origin, dir, t) {
        return origin.add(dir.multiplyScalar(t))
    }

}