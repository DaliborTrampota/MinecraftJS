import Interface from "./Interface.js";
import InterfaceFactory from "./InterfaceFactory.js";


export default class FurnaceInterface extends Interface {

    constructor(entity) {
        super()
        this.entity = entity
        this.html = new InterfaceFactory(5, 5, 'furnace')
            .section(3, 2, 0, 0, 'input')
            .section(1, 1, 4, 2, 'fuel')
            .section(2, 1, 6, 0.5, 'output')
            .build()
    }
}