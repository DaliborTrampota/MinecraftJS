export default class Interface {

    static empty = '/src/resources/images/empty.png'
    
    constructor(){
        this.htmlSlots = []

        this.background 
        this.isOpen = false

        this.GUI = document.getElementById('gui')
        this.GUI_IMAGE// = document.getElementById('gui-bg')

        this.dragging = false
    }

    setInterface(html, background) {
        this.GUI_IMAGE = html.childNodes.item(html.childNodes.length - 1)
        this.GUI.appendChild(html)
        if(background) this.GUI_IMAGE.src = background
    }

    clearInterface() {
        while (this.GUI.firstChild) {
            this.GUI.removeChild(this.GUI.lastChild);
        }
        
        let last = this.html.childNodes.item(this.html.childNodes.length - 1)
        console.log(last.tagName)
        if(last.tagName == 'img') last.remove() // remove the background
    }

    update() {
        if(!this.htmlSlots.length) this.htmlSlots = this.html.getElementsByClassName('gui-slot')
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
    }

    toggle(){
        this.isOpen = !this.isOpen

        if(this.isOpen) this.open()
        else this.close()
    }


    connect(e){
        for(let s of this.htmlSlots){
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

    allowDrop(e){
        e.preventDefault()
    }
}