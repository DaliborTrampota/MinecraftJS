import StorageInterface from "../Interfaces/StorageInterface.js";


export default class Inventory extends StorageInterface {

    constructor(hotbarSize = 10){
        super(4, 10)

        this.htmlSlots = []
        this.hotbar = new Array(hotbarSize)
        this.selectedSlot = 0

        Inventory.makeHotbar(hotbarSize)
        Inventory.formatSlots(this)
    }

    get slot() {
        return this.hotbar[this.selectedSlot]
    }

    set slot(index) {
        if(index >= this.hotbar.length) index = 0
        else if(index < 0) index = this.hotbar.length - 1

        let curSlot = this.htmlSlots[this.selectedSlot]
        let newSlot = this.htmlSlots[index]

        curSlot.slot.id = ""
        newSlot.slot.id = "selected"

        this.selectedSlot = index
    }

    setItem(item, index = -1){
        //if(index == -1) //find next free slot
        if(this.hotbar[index]) return false

        this.hotbar[index] = item
    }

    setStack(stack, index = -1){
        //if(index == -1) //find next same item slot or free slot
        let curStack = this.hotbar[index]
        if(curStack)
            return curStack.merge(stack)
        
        return false
    }

    updateSlot(index){
        const stack = this.hotbar[index]
        if(stack){
            this.htmlSlots[index].image = this.hotbar[index].item.image
            this.htmlSlots[index].count = this.hotbar[index].amount
        }else{
            this.htmlSlots[index].image = Inventory.empty
            this.htmlSlots[index].count = ''
        }
    }

    static makeHotbar(hotbarSize){
        let hotbar = document.getElementById("hotbar")
        for(let i = 0; i < hotbarSize; i++){
            hotbar.insertAdjacentHTML('beforeend',
                `<div class="slot" id=${i == 0 ? `selected` : ''}>
                    <span>${i + 1}</span>
                    <img src="${Inventory.empty}" alt="item"/>
                    <span>64</span>
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
        inv.htmlSlots = formatted

    }
}

