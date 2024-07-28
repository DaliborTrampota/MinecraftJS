
export default class BlockEntity extends EventTarget {

    constructor(block) {
        super()
        this.block = block
        
        window.game.addUpdateSub(this)
    }

    async Init() {}

    Update(delta) {
        
    }
}