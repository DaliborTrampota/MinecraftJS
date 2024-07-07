

export default class Palette {

    constructor() {
        this.blocks = {}
        this.totalWeight = 0
    }

    addBlock(block, weight) {
        this.blocks[block.id] = weight
        this.totalWeight += weight
        return this
    }

    /**
     * Returns random block based on the weights
     * @returns {Number} blockID
     */
    getBlock() {
        if(this.totalWeight === 1) {
            return Number(Object.keys(this.blocks)[0])
        }
        const random = Math.random() * this.totalWeight
        let cursor = 0
        for(let blockID in this.blocks) {
            cursor += this.blocks[blockID]
            if(cursor >= random) return Number(blockID)
        }
        console.error(random, cursor, this.blocks, this.totalWeight)
        throw new Error("Palette: this is not possible!?")
    }

    static solid(block) {
        return new Palette().addBlock(block, 1)
    }
}