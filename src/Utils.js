function create3DArray(x, y, height){
    let arr = new Array(x)
    for(let i = 0; i < x; ++i){
        arr[i] = new Array(y)
        for(let j = 0; j < y; ++j){
            arr[i][j] = new Array(height)
        }
    }
    return arr
}

function create2DArray(x, y){
    let arr = new Array(x)
    for(let i = 0; i < x; ++i){
        arr[i] = new Array(y)
    }
    return arr
}

function createEnum(arr, reversed = false){
    let enumObj = {};
    for(let i = 0; i < arr.length; ++i){
        if(reversed) enumObj[i] = arr[i];
        else enumObj[arr[i]] = i;
    }

    return enumObj;
}

class TwoWayMap extends Map{
    constructor(iterable){
        super(iterable)
        this.reversed = new Map()
        this.ID = 0
    }

    get(query){
        return this.has(query) ? super.get(query) : this.reversed.get(query)
    }

    add(name){
        super.set(name, this.ID)
        this.reversed.set(this.ID, name)
        ++this.ID
    }

    keys(){
        return super.keys()
    }
}

export {
    create3DArray,
    create2DArray,
    createEnum,
    TwoWayMap
}
