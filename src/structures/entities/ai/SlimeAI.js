import { Vector3 } from "three"
import BaseAI from "./BaseAI"



export default class SlimeAI extends BaseAI {

    constructor(mobEntity) {
        super(mobEntity)

        this.actionDelay = 4
    }


    startAction() {
        this.actionCountdown = 0
        this.mob.velocity = new Vector3(Math.random() * 20 - 10, 8, Math.random() * 20 - 10)
    }



}