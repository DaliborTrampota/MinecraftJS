

export default class BlockEntity {

    constructor(block, interfaceClass) {
        this.block = block
        this.interfaceClass = interfaceClass ?? false
        
        window.game.addUpdateSub(this)
    }

    
    get hasInterface() {
        return this.interfaceClass
    }

    async Init() {}

    Update(delta) {
        
    }

    onSlotChange(stack, section) {
        
    }

}