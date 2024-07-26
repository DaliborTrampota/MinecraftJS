import { Vector3 } from "three";
import Block from "./Block";



export default class PhysicalBlock extends Block {

    constructor(key, material){
        super(key, material)

        this.weight = 1
        this.gravity = Vector3.Up.negate()
    }


    setWeight(w){
        this.weight = w
        return this
    }



}