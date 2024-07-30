import { Vector3 } from "three";
import LivingEntity from "./LivingEntity";



export default class MobEntity extends LivingEntity {

    constructor(mobData) {
        super(mobData.generateModel())
        this.ai = new mobData.aiClass(this)
        this.mobData = mobData

        this.maxUpStep = 1.1
        this.speed = 3
        
        window.game.addUpdateSub(this)
    }

    Update(delta) {
        super.Update(delta)
        this.ai.tick(delta)
    }



}