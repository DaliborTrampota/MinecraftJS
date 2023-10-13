

export default class BlockEntity {

    constructor(block, interfaceClass) {
        this.block = block
        this.interfaceClass = interfaceClass ?? false
        
        window.game.addUpdateSub(this)
    }

    
    get hasInterface() {
        return Boolean(this.interfaceClass)
    }

    // open() {
    //     if(!this.hasInterface) return false
    //     this.interface = new this.interfaceClass(this)
    //     return true
    // }

    async Init() {}

    Update(delta) {
        
    }

    onSlotChange(stack, section) {
        
    }

}