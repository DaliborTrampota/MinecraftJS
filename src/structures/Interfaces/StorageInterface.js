import InterfaceFactory from "./InterfaceFactory.js"


export default class StorageInterface {

    static empty = '/src/resources/images/empty.png'
    
    constructor(rows, columns){
        this.rows = rows
        this.columns = columns
        this.slots = new Array(rows * columns)
        this.htmlSlots = []

        this.background 
        this.open = false

        this.GUI = document.getElementById('gui')
        this.GUI_IMAGE = document.getElementById('gui-bg')

        this.dragging = false
    }

    get hasEmptySlot(){
        return this.emptySlot != -1
    }

    setInterface(html, background) {
        while (this.GUI.firstChild) {
            this.GUI.removeChild(this.GUI.lastChild);
        }
        this.GUI.appendChild(html)

        let bg = document.createElement('img')
        bg.setAttribute('id', 'gui-bg')
        bg.setAttribute('draggable', 'false')
        bg.src = background
        this.GUI.appendChild(bg)
        this.GUI_IMAGE = bg

        this.htmlSlots = document.getElementsByClassName('gui-slot')//].sort((a, b) => a.dataset.id - b.dataset.id)
    }

    update() {
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let stack = this.slots[i]
            console.log(stack)
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
    }

    slotFor(stack){
        for(let i = 0; i < this.slots.length; ++i){
            if(!this.slots[i]) return i
        }
        return -1
    }


    setStack2(stack, index){
        this.slots[index] = stack
        this.update()
    }



    toggle(controller){
        this.open = !this.open

        if(this.open){
            controller.inGUI = true
            document.exitPointerLock()
            //this.GUI_IMAGE.src = this.background
            this.GUI.style.display = 'block'
            this.connect()
        }else{
            controller.inGUI = false
            this.GUI.style.display = 'none'
            document.body.requestPointerLock()
        }
    }


    connect(e){
        let slots = document.getElementsByClassName('gui-slot')

        for(let s of slots){
            s.ondragstart = this.dragStart.bind(this)
            s.ondrop = this.onDrop.bind(this)
            s.ondragover = this.allowDrop.bind(this)
        }
    }

    dragStart(e){
        console.log(e)
        e.dataTransfer.setData("id", e.target.dataset.id);
    }

    onDrop(e){
        e.preventDefault();
        const sourceSlotID = e.dataTransfer.getData("id");
        const targetSlotID = e.target.dataset.id;

        const temp = this.slots[sourceSlotID]
        this.slots[sourceSlotID] = this.slots[targetSlotID]
        this.slots[targetSlotID] = temp
        
        this.update()
    }

    allowDrop(e){
        //console.log(e)
        e.preventDefault()
    }
}