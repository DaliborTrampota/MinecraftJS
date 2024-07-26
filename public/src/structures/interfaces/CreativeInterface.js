import Items from "../registers/Items";
import InterfaceFactory from "./InterfaceFactory";
import InventoryInterface from "./InventoryInterface";


export default class CreativeInventoryInterface extends InventoryInterface {

    static COLUMNS = 10
    constructor(player) {
        super(player)
        
        const items = Items.all()
        console.log(Math.ceil(items.length / CreativeInventoryInterface.COLUMNS))
        this.html = new InterfaceFactory(5, 5, 'creative-inventory')
            .section(CreativeInventoryInterface.COLUMNS, Math.ceil(items.length / CreativeInventoryInterface.COLUMNS), 0, 0, 'slots')
            //.tab('test', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/75/Wheat_JE2_BE2.png', (t) => console.log('clicked tab', t))
            .build(true, this)
    }


}