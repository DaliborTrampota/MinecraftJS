
export default class BlockEntity extends EventTarget {

    constructor(block, interfaceClass) {
        super()
        this.block = block
        
        window.game.addUpdateSub(this)
    }
    
    putToSlots(slots, stacks) {
        stck:
        for(let stack of stacks) {
            let emptyIdx = -1
            for(let i = 0; i < slots.length; i++) {
                if(!slots[i] && emptyIdx == -1) emptyIdx = i
                if(slots[i]?.item == stack.item) {
                    slots[i].merge(stack)
                    continue stck;
                }
            }
            if(emptyIdx == -1) return false
            slots[emptyIdx] = stack
        }
        return true
    }

    hasSpaceForOutput(slots, output) {
        for(let stack of output) {
            let emptyIdx = -1
            for(let i = 0; i < slots.length; i++) {
                if(!slots[i] && emptyIdx == -1) emptyIdx = i
                if(slots[i]?.item == stack.item) {
                    if(slots[i].amount + stack.amount > stack.item.stack) return false
                    continue;
                }
            }
            if(emptyIdx == -1) return false
        }
        return true
    }

    // open() {
    //     if(!this.hasInterface) return false
    //     this.interface = new this.interfaceClass(this)
    //     return true
    // }

    async Init() {}

    Update(delta) {
        
    }

    onSlotChange(stack, section, id) {     
    }

}