import { Vector3 } from "three";
import Feature from "../level/generators/Feature";
import AbstractRegister from "./AbstractRegister";
import Palette from "../level/generators/Palette";
import Blocks from "./Blocks";



export default class Features extends AbstractRegister {


    constructor() {
        super()
    }
    
    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
            // const observer = new Proxy(this.INSTANCE, {
            //     set: (target, prop, value) => {
            //         console.log("Setting", prop, "to", value)
            //         target[prop] = value
            //         return true
            //     }
            // })
            this.init()
        }
        return this.INSTANCE
    }

    // static register(block) {
    //     if(!(block instanceof Block)) {
    //         console.error("Block must be an instance of Block", block)
    //         return this
    //     }
        
    //     block.id = Blocks.ID
    //     Blocks.new().map.set(Blocks.ID, block.key)
    //     Blocks.ID++

    //     return block
    // }

    static init() {
        console.log("init features")
        this.TREE = new Feature('tree')
                .createCone(new Vector3(0, 5, 0), 3, 2, Palette.solid(Blocks.LEAVES))
                .createLine(new Vector3(0, 0, 0), new Vector3(0, 5, 0), Palette.solid(Blocks.OAK_LOG));

        this.POND = new Feature('pond')
            .createCone(new Vector3(0, 0, 0), 2, -2, Palette.solid(Blocks.WATER_STILL))

        Features.new().map.set(Features.ID, this.TREE.key)
        Features.new().map.set(Features.ID, this.POND.key)
    }
}