import '../tools/Extensions.js'
import { baseURL } from '../tools/Constants.js'
import Blocks from '../registers/Blocks.js'
import ResourceManager from '../tools/ResourceManager.js'
import WorkerChunk from "./WorkerChunk"


let chunk

console.log('worker created')
self.addEventListener('message', async ({ data: { type, data} }) => {
    console.log(type, data, 'worker')
    switch(type) {
        case 'build':
            await new ResourceManager(baseURL).fetchBlocks()
            Blocks.new().generateModels()
            chunk = new WorkerChunk(data.x, data.y, data.data, data.metadata, data.breaking)
            chunk.build()
            break

        case 'rebuild':
            chunk.breaking = data.breaking
            chunk.metadata = data.metadata
            chunk.data = data.data
            chunk.rebuild()
            break

        case 'resources':
            // chunk.register = JSON.parse(data)
            break
    }
    // for(let d of e.data) {

    // }
})