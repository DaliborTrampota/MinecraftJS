import { Vector3 } from "three"



export default class BaseAI {

    constructor(mobEntity) {
        this.mob = mobEntity

        this.actionDelay = 5
        this.moveTimer = 0
        this.actionTimer = 0

    }

    tick(delta) {
        if(this.actionTimer > 0) {
            this.actionTimer -= delta
            this.doAction(delta)
        } else if(this.actionTimer < 0) {
            this.stopAction()
            this.actionTimer = 0
        } else {
            this.moveTimer += delta
            if(this.moveTimer > this.actionDelay) {
                this.moveTimer = 0
                this.startAction()
            }
        }
    }

    startAction() {
        this.actionTimer = 3

        //this.mob.moveDirection.set(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize()

    }

    stopAction() {
        this.mob.moveDirection.set(0, 0, 0)
    }

    doAction() {
        //this.mob.velocity = new Vector3(Math.random() * 30 - 10, 8, Math.random() * 20 - 10)
    }

    get world() {
        return this.mob.world
    }


}