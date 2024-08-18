export default class Interface {

    static empty = '/resources/empty.png'
    static GUI = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? null : document.getElementById('gui')
    
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

    /**
     * This is called only when item is dropped to same interface as it was dragged from.
     * Otherwise implement override in child class.
     * @param {DragEvent} e event
     */
    allowDrop(e) {
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []

        const targetSection = e.target.dataset.section
        const targetSlotID = Number(e.target.dataset.id)
        if(Number(slotID) === targetSlotID && section === targetSection) 
            return console.debug('Same slot')

        const originStack = this.slots(section)[Number(slotID)]
        this.allowDropMergeCheck(e.target.dataset.section, Number(e.target.dataset.id), originStack) 
            ? e.preventDefault() 
            : console.debug("Slot already occupied")
    }

    allowDropMergeCheck(tSection, tID, originStack) {
        const curStack = this.slots(tSection)[Number(tID)]
        if(curStack) {
            if(curStack.item === originStack.item && curStack.amount + originStack.amount > curStack.item.stack)
                return false
        }
        return true
    }

    swapOrMerge(origin, target, data){
        const temp = origin[data.originID]
        if(target[data.targetID]?.item == origin[data.originID].item) { //merge if same items
            target[data.targetID].merge(origin[data.originID])
            if(!origin[data.originID].amount) origin[data.originID] = undefined
            return target[data.targetID]
        }
        // swap
        origin[data.originID] = target[data.targetID]
        target[data.targetID] = temp
        
        return temp
    } 
}