import Stack from "../item/Stack";
import Items from "../registers/Items";
import Interface from "./Interface";
import InterfaceFactory from "./InterfaceFactory";


export default class CreativeSection extends Interface {

    static COLUMNS = 10
    constructor() {
        super()
        
        this.items = Items.all()

        const tabs = new Set(this.items.map(i => i.tab))
        const factory = new InterfaceFactory(5, 5, 'creative-inventory')
            .section(CreativeSection.COLUMNS, Math.ceil(this.items.length / CreativeSection.COLUMNS), 0, 0, 'slots')
        for(let t of tabs)
            factory.tab(t, Items.OAK_LOG.image, this.switchTab.bind(this, t))
        this.html = factory.build(true, this)

        this.activeTab = 'DEFAULT'
    }

    update() {
        let i = 0
        for(let item of this.items) {
            if(item.tab !== this.activeTab) continue
            try {
                let stack = Stack.create(item.key, 1)
                InterfaceFactory.setSlot(this.htmlSlots[i], stack)
                i++
            } catch {
                console.error(`Failed to create stack for item: ${item.key}`)
            }
        }
        for(let j = i; j < this.htmlSlots.length; ++j) {
            InterfaceFactory.clearSlot(this.htmlSlots[j])
        }
    }

    switchTab(t) {
        this.activeTab = t
        this.update()
    }

    slots(section) {
        return this.items.filter(i => i.tab === this.activeTab).map(i => Stack.create(i.key, i.stack))
    }

}