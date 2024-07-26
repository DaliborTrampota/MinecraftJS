const MARGIN = 16
const FRAME = 2

class InterfaceFactory {

    constructor(xGap, yGap, name) {
        this.name = name
        this.slots = []
        this.htmlSlots = {}
        this.tabs = []
        this.xGap = xGap ?? 5
        this.yGap = yGap ?? 5
    }

    position(x, y, img, { gapAlignX = false, gapAlignY = false}) {
        if(!gapAlignX) x -= 1
        if(!gapAlignY) y -= 1
        return {
            top: Slot.HEIGHT * y + y * this.yGap + (gapAlignY ? -this.yGap / 2 : Slot.HEIGHT / 2) - img.height / 2,
            left: Slot.WIDTH * x + x * this.xGap + (gapAlignX ? -this.xGap / 2 : Slot.WIDTH / 2) - img.width / 2
        }
        //5, 1, arrow, { gapAlignY: true }
        canvas.style.top = InterfaceFactory.Slot.HEIGHT + 2 - arrow.height/2+ 'px';
        canvas.style.left = InterfaceFactory.Slot.WIDTH*4 + 20 + InterfaceFactory.Slot.WIDTH/2- arrow.width/2 + 'px';
    }
    
    section(xCount, yCount, x, y, name) {
        x = x * Slot.WIDTH + x * this.xGap
        y = y * Slot.HEIGHT + y * this.yGap
        
        for(let i = 0; i < yCount; i++) {
            for(let j = 0; j < xCount; j++) {
                this.slots.push(new Slot(x + j * this.xGap + Slot.WIDTH * j, y + i * this.yGap + Slot.HEIGHT * i, name, i * xCount + j))
            }
        }
        return this
    }

    tab(id, img, onClick) {
        this.tabs.push({
            id,
            img,
            onClick,
        })

        return this
    }

    build(background, iface) {
        const div = document.createElement('div')
        div.setAttribute('class', 'gui-container')
        div.dataset.interface = this.name
        
        let minX = Infinity 
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        this.slots.forEach((slot, i) => {
            const html = slot.build()
            this.htmlSlots[i] = html
            div.appendChild(html)
            if(slot.x < minX) minX = slot.x
            if(slot.x > maxX) maxX = slot.x
            if(slot.y < minY) minY = slot.y
            if(slot.y > maxY) maxY = slot.y

        })

        this.tabs.forEach((tabData, i) => {
            const tab = document.createElement('button')
            tab.setAttribute('class', 'gui-tab')
            tab.dataset.id = tabData.id
            tab.onclick = tabData.onClick.bind(null, tabData.id)
            
            tab.style.position = 'absolute'
            tab.style.width = (Slot.WIDTH) + 'px'
            tab.style.height = (Slot.HEIGHT) + 'px'
            tab.style.left = (Slot.WIDTH * i) + 'px'
            tab.style.top = -(Slot.HEIGHT + this.yGap) + 'px'

            const img = document.createElement('img')
            // img.style.position = 'absolute'
            img.src = tabData.img
            // img.style.top = '0px'
            // img.style.left = '0px'
            img.width = Slot.WIDTH
            img.height = Slot.HEIGHT

            img.setAttribute('alt', `tab ${tabData.id}`)
            img.setAttribute('class', 'pixelated')


            tab.appendChild(img)
            div.appendChild(tab)

        })

        const width = (maxX - minX) + Slot.WIDTH
        const height = (maxY - minY) + Slot.HEIGHT
        div.style.width = width + 'px'
        div.style.height = height + 'px'

        if(background) {
            const dataURL = this.generateBackground(width, height)
            let bg = document.createElement('img')
            bg.setAttribute('class', 'gui-bg')
            bg.setAttribute('draggable', 'false')
            bg.src = dataURL
            bg.style.top = -MARGIN/2 + 'px'
            bg.style.left = -MARGIN/2 + 'px'
            bg.style.width = width + MARGIN + 'px'
            bg.style.height = height + MARGIN + 'px'
            div.appendChild(bg)
            iface.background = dataURL
        }

        return div
    }

    generateBackground(width, height) {
        const canvas = document.createElement('canvas')
        canvas.width = width + MARGIN
        canvas.height = height + MARGIN

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'rgba(96, 96, 96)'
        ctx.fillRect(0, 0, width + MARGIN, height + MARGIN)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(FRAME, FRAME, width + MARGIN - FRAME*2, height + MARGIN - FRAME*2)

        this.slots.forEach(slot => {
            ctx.drawImage(window.images.slot, slot.x + MARGIN/2, slot.y + MARGIN/2, Slot.WIDTH, Slot.HEIGHT)
        })
        let dataURL = canvas.toDataURL()
        canvas.remove()
        return dataURL
    }



    static setSlot(htmlSlot, stack) {
        htmlSlot.children[0].src = stack.item.image
        htmlSlot.children[0].setAttribute('alt', `${stack.item.name}`)
        htmlSlot.children[1].innerHTML = stack.amount
    }

    static clearSlot(htmlSlot) {
        htmlSlot.children[0].src = Slot.EMPTY
        htmlSlot.children[0].setAttribute('alt', 'empty slot')
        htmlSlot.children[1].innerHTML = ''
    }

    static bake(iface1, iface2) {
        const height = iface1.style.height
        const top = parseInt(iface1.style.top)

    }
}

class Slot {

    static EMPTY = '/resources/images/empty.png' // '/resources/textures/items/baked_potato.png' 
    static WIDTH = 48
    static HEIGHT = 48

    constructor(x, y, section, id) {
        this.x = x
        this.y = y
        this.section = section
        this.id = id
    }

    build() {
        let slot = document.createElement('div')
        let image = document.createElement('img')
        let counter = document.createElement('span')
        
        image.setAttribute('alt', 'empty slot')
        image.setAttribute('class', 'pixelated')

        slot.setAttribute('draggable', 'true')
        slot.setAttribute('class', 'gui-slot')
        slot.style.position = 'absolute'
        slot.style.width = Slot.WIDTH + 'px'
        slot.style.height = Slot.HEIGHT + 'px'
        slot.style.left = this.x + 'px'
        slot.style.top = this.y + 'px'
        slot.dataset.section = this.section
        slot.dataset.id = this.id

        image.src = Slot.EMPTY
        counter.innerHTML = ''

        slot.appendChild(image)
        slot.appendChild(counter)

        return slot
    }
}

class Hotbar {

    constructor(size) {
        this.size = size
    }

    build(hotbar) {
        const slots = []
        for(let i = 0; i < this.size; i++) {
            const slot = document.createElement('div')
            const index = document.createElement('span')
            const image = document.createElement('img')
            const count = document.createElement('span')

            slot.setAttribute('class', 'hotbar-slot')
            slot.setAttribute('id', i == 0 ? 'selected' : '')
            index.innerHTML = i + 1
            image.src = Slot.EMPTY
            image.setAttribute('alt', 'empty hotbar slot')

            slot.appendChild(index)
            slot.appendChild(image)
            slot.appendChild(count)

            slots.push({ html: slot, image, count })
            hotbar.appendChild(slot)
        }
        return slots
    }
}

InterfaceFactory.Hotbar = Hotbar
InterfaceFactory.Slot = Slot
export default InterfaceFactory