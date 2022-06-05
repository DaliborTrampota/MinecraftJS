

export default class StorageInterface {

    static empty = '/src/resources/images/empty.png'
    
    constructor(rows, columns){
        this.rows = rows
        this.columns = columns
        this.slots = new Array(rows * columns)
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

}