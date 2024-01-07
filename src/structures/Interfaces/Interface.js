export default class Interface {

    static empty = '/resources/images/empty.png'
    static GUI = document.getElementById('gui')
    
    constructor(){
        this.isOpen = false
        this.dragging = false
        this.background

        this.html
        this.htmlSlots = []
        this.htmlBg
    }

    get width() {
        return this.html.querySelector('img.gui-bg').width
    }
    
    get height() {
        return this.html.querySelector('img.gui-bg').height
    }

    get name() {
        return this.html.dataset.interface
    }

    draw() {
        Interface.GUI.appendChild(this.html)
        this.htmlSlots = this.html.getElementsByClassName('gui-slot')
        
        if(this.background) {
            this.htmlBg = this.html.childNodes.item(this.html.childNodes.length - 1)
            this.htmlBg.src = this.background
        }
        this.update()
    }

    open() {
        this.draw()
        Interface.GUI.style.display = 'block'
        document.exitPointerLock()
        this.connect()
        this.isOpen = true
    }


    toggle(){
        this.isOpen
            ? this.close() 
            : this.open()
    }

    close() {
        Interface.GUI.innerHTML = ''
        Interface.GUI.style.display = 'none'
        document.body.requestPointerLock()
        this.isOpen = false
    }


    connect(e){
        for(let s of this.htmlSlots){
            s.ondragstart = this.dragStart.bind(this)
            s.ondrop = this.onDrop.bind(this)
            s.ondragover = this.allowDrop.bind(this)
        }
    }

    dragStart(e){
        const { dataset, parentNode } = e.target
        e.dataTransfer.setData("id", dataset.id);
        e.dataTransfer.setData("originSection", dataset.section);
        e.dataTransfer.setData("originInterface", parentNode.dataset.interface);
        e.dataTransfer.setData(`dragover:${parentNode.dataset.interface}:${dataset.id}:${dataset.section}`, true);
    }

    onDrop(e){
        e.preventDefault()
        return {
            originID: Number(e.dataTransfer.getData("id")),
            originSection: e.dataTransfer.getData("originSection"),
            originInterface: e.dataTransfer.getData("originInterface"),
            targetID: Number(e.target.dataset.id),
            targetSection: e.target.dataset.section,
            targetInterface: e.target.parentNode.dataset.interface
        }
    }

    allowDrop(e){ //drop from-to same interface
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []//origin data
        if(!ifaceName || ifaceName == e.target.parentNode.dataset.interface) return e.preventDefault(e) //same interface?
            

        //const originInterface = this.interfaces[ifaceName] ?? this
        //const originSlots = originInterface.slots(section)

        //const stack = originSlots[Number(slotID)]
        let targetSlotID = Number(e.target.dataset.id)
    
        const curStack = this.slots(e.target.dataset.section)[targetSlotID]
        !curStack ? e.preventDefault(e) : console.log("Slot already occupied")
    }

    swap(origin, target, data){
        const temp = origin[data.originID]
        origin[data.originID] = target[data.targetID]
        target[data.targetID] = temp
        console.log(temp, data, origin)
        return temp
    } 
}