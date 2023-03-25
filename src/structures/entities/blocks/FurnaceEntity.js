import FurnaceInterface from "../../interfaces/FurnaceInterface.js";
import BlockEntity from "../BlockEntity.js";
import Blocks from "../../registers/Blocks.js";


export default class FurnaceEntity extends BlockEntity {

    constructor() {
        super(Blocks.FURNACE, FurnaceInterface)

        this.inputSlots = new Array(6)
        this.fuelSlots = new Array(1)
        this.outputSlots = new Array(2)

        this.fuelMap = new Map()
        this.Init()
    }

    async Init() {
        super.Init()
        const Items = await import('./../../registers/Items.js').then(r => r.default)

        this.fuelMap.set(Items.OAK_LOG, 200)
    }

    slots(section) {
        return this[`${section}Slots`]
    }

    openInterface(player) {
        const iface = new this.interfaceClass(this)
        player.openInterface(iface)
    }

    Update(delta) {
        super.Update(delta)
    }


    validateItem(slot, item) {
        if(slot == 'input')
            return this.findRecipe(item)

        if(slot == 'fuel')
            return this.isFuel(item)

        return false
    }

    addStack(slot, stack, index) {
        const slots = this.slots(slot)
        index ??= this.getSlotFor(slots, stack)
        if(index == -1) return stack

        if(slots[index]) slots[index].merge(stack)
        else slots[index] = stack

        return true
    }

    getSlotFor(slots, stack) {
        return slots.findIndex(s => s?.item.id == stack.item.id && !s.full)
    }

    findRecipe(item) {
        if(item.key == 'oak_log') return true
    }

    isFuel(item) {
        return this.fuelMap.has(item)
    }



}