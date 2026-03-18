

export default class ResourceManager {

    static textures = {}
    static data = {}
    static images = {}

    constructor() {
        this.data = {}
    }

    async fetchData() {
        ResourceManager.textures = await this.#makeRequest(`atlases`)
        ResourceManager.data.blocks = this.#makeRequest(`data/blocks`)
        ResourceManager.data.items = this.#makeRequest(`data/items`)
        ResourceManager.data.recipes = this.#makeRequest(`data/recipes`)
        ResourceManager.data.entities = this.#makeRequest(`data/entities`)
        ResourceManager.data.lootTables = this.#makeRequest(`data/lootTables`)
        // let biomeData = await fetch('/biomes').then(res => res.json())
        // let dimensionData = await fetch('/dimensions').then(res => res.json())
        // let structureData = await fetch('/structures').then(res => res.json())
        await Promise.all(Object.values(ResourceManager.data))
        for(let key in ResourceManager.data) {
            ResourceManager.data[key] = await ResourceManager.data[key]
        }
    }


    async fetchImages() {
        ResourceManager.images.slot = this.#loadImage(`/resources/gui/slot.png`)
        ResourceManager.images.progressArrow = this.#loadImage(`/resources/gui/progressArrow.png`)
        
        await Promise.all(Object.values(ResourceManager.images))
        for(let key in ResourceManager.images) {
            ResourceManager.images[key] = await ResourceManager.images[key]
        }
    }
    
    #loadImage(path) {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.src = path
        })
    }

    #makeRequest(path) {
        return fetch(`api/${path}`).then(r => r.json())
    }
}