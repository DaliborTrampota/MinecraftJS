import Blocks from "../registers/Blocks"
import { Material, WORLD_SETTINGS } from "../tools/Constants"
import TerrainBuilder from "./TerrainBuilder"


const { chunkSize, chunkHeight } = WORLD_SETTINGS

export default class WorkerChunk {

    constructor(x, y, voxelData, metadata, breaking) {
        this.x = x
        this.y = y

        this.data = voxelData
        this.metadata = metadata
        this.breaking = breaking

        this.builder = new TerrainBuilder(this)

        this.output = {}
    }

    async build() {
        await this.builder.build()

        this.output.attributes = {
            position: { data: this.builder.vertices, size: 3 },
            uvs: { data: this.builder.UVs, size: 2 },
            ao: { data: this.builder.ao, size: 1 },
            chunkPos: { data: this.builder.chunkPosAttr, size: 2 },
        }
        this.output.groups = this.builder.groups

        this.send()
    }

    rebuild() {
        this.builder.rebuild()
    }

    send() {
        this.postMessage('output', this.output)
    }

    postMessage(type, data) {
        postMessage({ type, data })
    }

    
    getBlockState(pos) {
        return this.metadata[`${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`]
    }

    /**
    * @returns true if should render the face
    */
    async checkVoxel(pos, blockData, side){
        if(pos.y < 0 || pos.y >= chunkHeight) return true

        let block;
        if(pos.x < 0 || pos.x >= chunkSize || pos.z < 0 || pos.z >= chunkSize) {//outside chunk
            pos.x += this.x * chunkSize
            pos.z += this.y * chunkSize
            block = await this.requestVoxel(pos)
            // block = this.world.getVoxelFromPos(pos)
        }else {
            block = this.getVoxel(pos)
        }

        if(block.voxel) {//TODO culling here?
            return true
            //this works when the voxel model side is full square, doesnt work for example from side of stairs
            // let oppositeSide = getOppositeSide(side)
            // let blockState = this.getBlockState(pos)
            // let rotatedSide = blockState ? VoxelBuilder.rotateSide(oppositeSide, blockState.angle, blockState.rotationAxis) : oppositeSide
            // return !block.vertices[rotatedSide].every(d => d.cullface)
        }
        if(block.material == Material.AIR) return true
        if(block.material == Material.LIQUID) return blockData.id != block.id
        if(block.transparent) return blockData.selfCulled || blockData.id != block.id
        
        return false
    }

    getVoxel(pos){
        let blockID = this.data[pos.x][pos.y][pos.z]
        if(!blockID && blockID != 0) {
            return false
        }
        return Blocks.get(blockID)
    }

    async requestVoxel(pos) {
        return new Promise((resolve, reject) => {
            const cb = (e) => {
                if(e.data.type == 'getVoxel'){
                    self.removeEventListener('message', cb)
                    resolve(Blocks.get(e.data.data))
                }
            }
            this.postMessage('getVoxel', pos)
            self.addEventListener('message', cb)
        })
    }
}

