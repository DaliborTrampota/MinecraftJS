import InventoryInterface from "../interfaces/InventoryInterface.js"


export default class Inventory {

    static COL = 10
    static ROW = 4
    static HOTBAR_SIZE = 10

    constructor(player) {
        this.interface = new InventoryInterface(player)

        this.slots = new Array(Inventory.COL * Inventory.ROW + Inventory.HOTBAR_SIZE)
        this.armor = new Array(4)
        this.offhand = new Array(1)
        this.hotbar = this.slots.view(this.slots.length - Inventory.HOTBAR_SIZE, this.slots.length) //view to the hotbar slots in the inventory
        
        this.selectedSlot = 0

        //window.game.addUpdateSub(this)
    }

    get hotbarStartIndex() {
        return this.slots.length - this.hotbar.length
    }

    get slot() {
        return this.hotbar[this.selectedSlot]
    }
    
    set slot(index) {
        if(index >= this.hotbar.length) index = 0
        else if(index < 0) index = this.hotbar.length - 1

        this.interface.selectHotbar(index)

        this.selectedSlot = index
    }

    addStack(stack) {
        while(stack.amount){
            let index = this.getSlotFor(stack)
            if(index != -1) {
                this.slots[index].merge(stack)
                continue
            }
            index = this.getEmptySlot()
            if(index != -1) {
                this.slots[index] = stack
                break
            }

            console.log('Inventory is full')
            break // full or empty stack was added to empty slot
        }
        this.interface.update()
    }

    getSlotFor(stack, priotizeHotbar = true) {
        const search = o => o?.item.id == stack.item.id && !o.full
        return priotizeHotbar ? this.slots.findIndexFrom(this.hotbarStartIndex, search, true) : this.slots.findIndex(search)
    }

    getEmptySlot(priotizeHotbar = true) {
        return priotizeHotbar ? this.slots.findIndexFrom(this.hotbarStartIndex, o => !o, true) : this.slots.findIndex(o => !o)
    }


    drop(amount = 1){
        if(!this.slot) return false
        
        let toDrop
        if(amount >= this.slot.amount){
            toDrop = this.slot
            this.hotbar[this.selectedSlot] = undefined
        }else{
            toDrop = this.slot.split(amount)
        }
        
        this.interface.updateHotbar()
        return toDrop
    }  

    onSlotChange(stack, section) {
        
    }

}