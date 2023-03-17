class InterfaceFactory {

    constructor(xGap, yGap) {
        this.slots = []
        this.htmlSlots = {}
        this.xGap = xGap ?? 5
        this.yGap = yGap ?? 5
    }

    section(xCount, yCount, x, y) {
        for(let i = 0; i < yCount; i++) {
            for(let j = 0; j < xCount; j++) {
                this.slots.push(new Slot(x + j * this.xGap + Slot.WIDTH * j, y + i * this.yGap + Slot.HEIGHT * i))
            }
        }
        return this
    }

    build() {
        const div = document.createElement('div')
        div.setAttribute('id', 'gui-container')
        let minX = Infinity 
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        this.slots.forEach((slot, i) => {
            const html = slot.build()
            html.dataset.id = i
            this.htmlSlots[i] = html
            div.appendChild(html)
            if(slot.x < minX) minX = slot.x
            if(slot.x > maxX) maxX = slot.x
            if(slot.y < minY) minY = slot.y
            if(slot.y > maxY) maxY = slot.y

        })
        div.style.width = (maxX - minX) + Slot.WIDTH + 'px'
        div.style.height = (maxY - minY) + Slot.HEIGHT + 'px'
        return div
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
}

class Slot {

    static EMPTY = '/src/resources/images/empty.png' // '/src/resources/textures/items/baked_potato.png' 
    static WIDTH = 48
    static HEIGHT = 48

    constructor(x, y) {
        this.x = x
        this.y = y
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

        image.src = Slot.EMPTY
        counter.innerHTML = ''

        slot.appendChild(image)
        slot.appendChild(counter)

        return slot
    }
}


InterfaceFactory.Slot = Slot
export default InterfaceFactory