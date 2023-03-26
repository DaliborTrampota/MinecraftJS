

export default class BlockEntity {

    constructor(block, interfaceClass) {
        this.block = block
        this.interfaceClass = interfaceClass ?? false
    }

    
    get hasInterface() {
        return this.interfaceClass
    }

    async Init() {}

    Update(delta) {
        
    }

}