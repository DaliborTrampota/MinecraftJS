

export default class StorageInterface {

    static empty = '/src/resources/images/empty.png'
    
    constructor(rows, columns){
        this.rows = rows
        this.columns = columns
        this.slots = new Array(rows * columns)

        this.background 
        this.open = false

        this.GUI = document.getElementById('gui')
        this.GUI_IMAGE = document.getElementById('gui-bg')

        this.dragging = false
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



    toggle(controller){
        this.open = !this.open

        if(this.open){
            controller.inGUI = true
            document.exitPointerLock()
            this.GUI_IMAGE.src = this.background
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
        e.dataTransfer.setData("slot-id", e.target.id);
    }

    onDrop(e){
        e.preventDefault();
        const slotID = e.dataTransfer.getData("slot-id");

        const slot = document.getElementById(slotID)
        const slotData = slot.firstElementChild
        slot.replaceChild(this.generateSlotData(), slotData)

        const targetSlot = e.target.parentNode
        const curSlotData = targetSlot.firstElementChild

        targetSlot.replaceChild(slotData, curSlotData);
    }

    allowDrop(e){
        //console.log(e)
        e.preventDefault()
    }

    generateSlotData(stack){
        let slotData = document.createElement('div')
        let image = document.createElement('img')
        let counter = document.createElement('span')

        slotData.setAttribute('class', 'gui-slot-data')
        image.setAttribute('alt', 'image')
        if(stack?.item.pixelated)
            image.setAttribute('class', 'pixelated')

        image.src = stack ? stack.item.image : StorageInterface.empty
        counter.innerHTML = stack ? stack.amount : ''

        slotData.appendChild(image)
        slotData.appendChild(counter)

        return slotData
    }
}