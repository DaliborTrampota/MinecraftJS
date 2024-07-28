import { Euler, Vector3 } from "three"
import BaseAI from "./BaseAI"



export default class RandomWalkAI extends BaseAI {

    constructor(mobEntity) {
        super(mobEntity)

        this.actionDelay = 5
    }


    doAction() {

    }

    startAction() {
        this.actionTimer = 3
        this.mob.moveDirection = new Vector3(0, 0, 1)
        const randDir = new Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize()
        this.mob.model.quaternion.setFromUnitVectors(Vector3.North, randDir)
        
    }

    stopAction() {
        this.mob.moveDirection = new Vector3(0, 0, 0)
    }



}