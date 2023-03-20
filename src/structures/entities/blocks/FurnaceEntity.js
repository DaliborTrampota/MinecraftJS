import FurnaceInterface from "../../interfaces/FurnaceInterface.js";
import Blocks from "../../registers/Blocks.js";
import BlockEntity from "../BlockEntity.js";


export default class FurnaceEntity extends BlockEntity {

    constructor() {
        super(Blocks.FURNACE, FurnaceInterface)

        this.inputSlots = []
        this.fuelSlots = []
        this.outputSlots = []
    }




}