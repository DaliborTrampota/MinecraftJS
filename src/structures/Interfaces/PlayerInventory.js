import InterfaceFactory from "./InterfaceFactory.js";
import Interface from "./Interface.js";


export default class Inventory extends Interface {

    static COL = 10
    static ROW = 4

    constructor(hotbarSize = 10){
        super()
        this.hotbarSize = hotbarSize
        this.htmlHotbarSlots = new InterfaceFactory.Hotbar(hotbarSize).build(document.getElementById("hotbar"))
        

        this.slots = new Array(Inventory.COL * Inventory.ROW + hotbarSize)
        this.hotbar = this.slots.view(this.slots.length - hotbarSize, this.slots.length) //view to the hotbar slots in the inventory
        this.selectedSlot = 0

        //this.background = '/src/resources/images/gui/inventory.png'

        const html = new InterfaceFactory(5, 5)
            .section(Inventory.COL, Inventory.ROW, 0, 0)
            .section(hotbarSize, 1, 0, Inventory.ROW * InterfaceFactory.Slot.HEIGHT + Inventory.ROW * 5 + 10, 'hotbar')
            .build()

        this.setInterface(html, this.background)
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

        let curSlot = this.htmlHotbarSlots[this.selectedSlot]
        let newSlot = this.htmlHotbarSlots[index]

        curSlot.html.id = ""
        newSlot.html.id = "selected"

        this.selectedSlot = index
    }

    update() {
        super.update()
        this.updateHotbar()
    }

    updateHotbar() {
        const setSlot = (html, stack) => {
            html.count.innerHTML = stack?.amount ?? ''
            html.image.src = stack?.item.image ?? InterfaceFactory.Slot.EMPTY
            if(stack?.item.pixelated) html.image.classList.add('pixelated')
            else html.image.classList.remove('pixelated')
            
        }
        for(let i = 0; i < this.hotbar.length; ++i) {
            const html = this.htmlHotbarSlots[i]
            if(!this.hotbar[i]?.amount) this.hotbar[i] = undefined
            setSlot(html, this.hotbar[i])
        }
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
        this.update()
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
        
        this.updateHotbar()
        return toDrop
    }   
}

