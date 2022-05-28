
import { Vector3, Vector2, BufferGeometry, BufferAttribute, Mesh } from 'https://cdn.skypack.dev/three@0.129.0';

export default class Block {

    constructor(blockID, chunk, pos){
        this.id = blockID
        this.chunk = chunk
        this.pos = pos

        this.metadata = {}
    }

    get worldPos(){
        return new Vector3(this.chunk.x + this.pos.x, this.pos.y, this.chunk.y + this.pos.z)
    }

    get isSolid(){
        return this.chunk.register.getBlockData(this.id).solid
    }

    setData(key, value){
        this.metadata[key] = value
    }

    getData(key){
        return this.metadata[key.toString()]
    }

    


} 