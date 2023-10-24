import FurnaceInterface from "../../interfaces/FurnaceInterface.js";
import Blocks from "../../registers/Blocks.js";
import Items from "../../registers/Items.js";
import MachineEntity from "../MachineEntity.js";


export default class FurnaceEntity extends MachineEntity {

    constructor() {
        super(Blocks.FURNACE, FurnaceInterface)
        
        this.inputSlots = new Array(6)
        this.fuelSlots = new Array(1)
        this.outputSlots = new Array(2)

        this.inputRows = [3, 3]

        this.fuelMap = new Map()
        this.Init()
    }

    async Init() {
        super.Init()

        this.fuelMap.set(Items.OAK_LOG, 200)
    }

    slots(section) {
        return this[`${section}Slots`]
    }

    validateItem(slot, item) {
        if(slot == 'input')
            return true//this.findRecipe(item)

        if(slot == 'fuel')
            return this.isFuel(item)

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

            console.log('Inventory is full')
            break // full or empty stack was added to empty slot
        }
        return !Boolean(stack.amount)
        
    }

    isFuel(item) {
        return this.fuelMap.has(item)
    }

    
    onSlotChange(stack, section, id) {
        super.onSlotChange(stack, section, id)
    }


}