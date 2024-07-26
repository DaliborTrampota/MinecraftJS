import Block from "./Block";


export default class SpriteBlock extends Block {

    //bitmask
    static Cross = 1
    static Box = 2
    static Floor = 4 

    constructor(key, material) {
        super(key, material)
        this.display = SpriteBlock.Cross
        this.ao = false //todo
    }

    getFace() {
        //create planes
    }



}