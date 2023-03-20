import InterfaceFactory from "./InterfaceFactory.js"


export default class Interface {

    static empty = '/src/resources/images/empty.png'
    
    constructor(){
        this.slots = []
        this.htmlSlots = []

        this.background 
        this.isOpen = false

        this.GUI = document.getElementById('gui')
        this.GUI_IMAGE = document.getElementById('gui-bg')

        this.dragging = false

        this.interfaces = {}
    }

    get hasEmptySlot(){
        return this.emptySlot != -1
    }


    slotFor(stack){
        for(let i = 0; i < this.slots.length; ++i){
            if(!this.slots[i]) return i
        }
        return -1
    }


    setStack(stack, index){
        this.slots[index] = stack
    }


    setInterface(html, background) {
        let bg = document.createElement('img')
        bg.setAttribute('class', 'gui-bg')
        bg.setAttribute('draggable', 'false')
        bg.src = background
        html.appendChild(bg)
        this.GUI_IMAGE = bg

        this.GUI.appendChild(html)
    }

    clearInterface() {
        while (this.GUI.firstChild) {
            this.GUI.removeChild(this.GUI.lastChild);
        }
    }

    update() {
        if(!this.htmlSlots.length) this.htmlSlots = this.html.getElementsByClassName('gui-slot') 
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let stack = this.slots[i]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
    }


    open() {
        this.setInterface(this.html, this.background)
        this.update()
        this.GUI_IMAGE.src = this.background
        this.GUI.style.display = 'block'
        document.exitPointerLock()
        this.connect()
    }

    close() {
        this.clearInterface()
        this.GUI.style.display = 'none'
        document.body.requestPointerLock()
        this.interfaces = {}
    }

    toggle(){
        this.isOpen = !this.isOpen

        if(this.isOpen) this.open()
        else this.close()
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
        e.dataTransfer.setData("id", e.target.dataset.id);
        e.dataTransfer.setData("originSection", e.target.dataset.section);
        e.dataTransfer.setData("originInterface", e.target.parentNode.dataset.interface);
    }

    onDrop(e){
        e.preventDefault();
        const sourceSlotID = e.dataTransfer.getData("id");
        const sourceInterfaceName = e.dataTransfer.getData("originInterface");
        const sourceSection = e.dataTransfer.getData("originSection");

        const targetSlotID = e.target.dataset.id;
        const targetInterfaceName = e.target.parentNode.dataset.interface;
        const targetSection = e.target.dataset.section;
        
        const sourceInterface = this.interfaces[sourceInterfaceName] ?? this
        const targetInterface = this.interfaces[targetInterfaceName] ?? this
        
        const temp = sourceInterface.slots[sourceSlotID]
        sourceInterface.slots[sourceSlotID] = targetInterface.slots[targetSlotID]
        targetInterface.slots[targetSlotID] = temp
        
        sourceInterface.update()
        targetInterface.update()
    }

    allowDrop(e){
        e.preventDefault()
    }
}