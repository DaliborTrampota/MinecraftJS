

export default class BlockState {

    constructor(pos, meta) {
        this.pos = pos
        this.id = `${pos.x}_${pos.y}_${pos.z}`

        this.direction = meta.direction ?? 'north'
        //this.inventory = new MachineInterface(meta.inventory ?? []) 
    }

    setDirection(direction) {
        this.direction = direction
        return this
    }

}