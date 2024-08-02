import CraftingTableInterface from "../../interfaces/CraftingTableInterface.js";
import Blocks from "../../registers/Blocks.js";
import Items from "../../registers/Items.js";
import MachineEntity from "../MachineEntity.js";


export default class CraftingTableEntity extends MachineEntity {

    constructor() {
        super(Blocks.CRAFTING_TABLE, CraftingTableInterface)
        
        this.inputSlots = new Array(9)
        this.outputSlots = new Array(1)

        this.inputRows = [3, 3, 3]
    }

    validateItem(slot, item) {
        if(slot == 'input')
            return true//this.findRecipe(item)

        return false
    }

    addStack(slots, stack, index) {
        index ??= this.getSlotFor(slots, stack)
        if(index == -1) return stack

        if(slots[index]) slots[index].merge(stack)
        else slots[index] = stack

        return true
    }

    
    addStack(stack, slots) {
        while(stack.amount){
            let index = this.getSlotFor(stack)
            if(index != -1) {
                slots[index].merge(stack)
                continue
            }
            index = this.getEmptySlot()
            if(index != -1) {
                slots[index] = stack
                break
            }

            console.debug('Inventory is full')
            break // full or empty stack was added to empty slot
        }
        return !Boolean(stack.amount)
        
    }
}