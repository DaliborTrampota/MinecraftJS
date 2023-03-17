import InterfaceFactory from "./InterfaceFactory.js";
import StorageInterface from "./StorageInterface.js";


export default class Inventory extends StorageInterface {

    constructor(hotbarSize = 10){
        super(4, 10)

        this.htmlHotbarSlots = []
        this.hotbar = new Array(hotbarSize)
        this.selectedSlot = 0

        //this.background = '/src/resources/images/gui/inventory.png'

        Inventory.makeHotbar(hotbarSize)
        Inventory.formatSlots(this)

        const html = new InterfaceFactory(5, 5)
            .section(10, 4, 0, 0)
            .section(10, 1, 0, 4 * InterfaceFactory.Slot.HEIGHT + 4 * 5 + 10)
            .build()

        this.setInterface(html, this.background)
    }

    get slot() {
        return this.hotbar[this.selectedSlot]
    }

    set slot(index) {
        if(index >= this.hotbar.length) index = 0
        else if(index < 0) index = this.hotbar.length - 1

        let curSlot = this.htmlHotbarSlots[this.selectedSlot]
        let newSlot = this.htmlHotbarSlots[index]

        curSlot.slot.id = ""
        newSlot.slot.id = "selected"

        this.selectedSlot = index
    }

    hotbarSlotFor(stack){
        let emptySlot = -1
        for(let i = 0; i < this.hotbar.length; ++i){
            if(emptySlot == -1 && !this.hotbar[i]) emptySlot = i
            else if(this.hotbar[i]) {
                if(this.hotbar[i].item.id == stack.item.id && !this.hotbar[i].full){
                    return i
                }
            }
        }
        return emptySlot
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
        
        this.updateHotbarSlot()
        return toDrop
    }

    addStack(stack){
        let set = false
        while(stack.amount && !set){
            let index = this.hotbarSlotFor(stack)
            if(index == -1) {//add to inv
                index = this.slotFor(stack)
                if(index == -1) return false

                this.slots[index] = stack
            }else{//add to hotbar
                if(!this.hotbar[index]) {
                    this.hotbar[index] = stack
                    set = true
                } else {
                    this.hotbar[index].merge(stack)
                }

                this.updateHotbarSlot(index)
            }
        }
    }

    setStack(stack, index = -1){
        if(index == -1) index = this.selectedSlot

        let curStack = this.hotbar[index]

        if(curStack) 
            return curStack.merge(stack)
        
        this.updateHotbarSlot(index)
        
        return output
    }

    updateHotbarSlot(index = this.selectedSlot){
        const stack = this.hotbar[index]
        if(stack && stack.amount){
            this.htmlHotbarSlots[index].count.innerHTML = stack.amount
            this.htmlHotbarSlots[index].image.src = stack.item.image
            if(stack.item.pixelated){
                this.htmlHotbarSlots[index].image.classList.add('pixelated')
            }else{
                this.htmlHotbarSlots[index].image.classList.remove('pixelated')
            }
        }else{
            this.htmlHotbarSlots[index].image.src = Inventory.empty
            this.htmlHotbarSlots[index].count.innerHTML = ''
            this.hotbar[index] = undefined
        }
    }

    static makeHotbar(hotbarSize){
        let hotbar = document.getElementById("hotbar")
        for(let i = 0; i < hotbarSize; i++){
            hotbar.insertAdjacentHTML('beforeend',
                `<div class="hotbar-slot" id=${i == 0 ? `selected` : ''}>
                    <span>${i + 1}</span>
                    <img src="${Inventory.empty}" alt="item"/>
                    <span></span>
                </div>`
            )
        }
    }

    static formatSlots(inv){
        let formatted = []
        let slotNodes = document.getElementById("hotbar").children
        for(let slot of slotNodes){
            let o = {
                slot: slot,
                image: slot.getElementsByTagName('img')[0],
                count: slot.getElementsByTagName('span')[1]
            }
            formatted.push(o)
        }
        inv.htmlHotbarSlots = formatted

    }
}

