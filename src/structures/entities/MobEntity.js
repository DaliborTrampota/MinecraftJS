import { Vector3 } from "three";
import LivingEntity from "./LivingEntity";



export default class MobEntity extends LivingEntity {

    constructor(mobData) {
        super(mobData.model)
        this.ai = new mobData.aiClass(this)
        this.mobData = mobData

        this.maxUpStep = 1.1
    }

    Update(delta) {
        super.Update(delta)
        this.ai.tick(delta)
    }



}