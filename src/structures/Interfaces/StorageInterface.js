

export default class StorageInterface {

    constructor(rows, columns){
        this.rows = rows
        this.columns = columns
        this.slots = new Array(rows * columns)
    }

    static empty = '/src/resources/images/empty.png'
}