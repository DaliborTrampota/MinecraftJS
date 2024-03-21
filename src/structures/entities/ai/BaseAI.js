import { Vector3 } from "three"



export default class BaseAI {

    constructor(mobEntity) {
        this.mob = mobEntity

        this.actionDelay = 5
        this.moveTimer = 0
        this.actionCountdown = 0

    }

    tick(delta) {
        if(this.actionCountdown > 0) {
            this.actionCountdown -= delta
            this.doAction()
        } else if(this.actionCountdown < 0) {
            this.stopAction()
            this.actionCountdown = 0
        } else {
            this.moveTimer += delta
            if(this.moveTimer > this.actionDelay) {
                this.moveTimer = 0
                this.startAction()
            }
        }
    }

    startAction() {
        this.actionCountdown = 3

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