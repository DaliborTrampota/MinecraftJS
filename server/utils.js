const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')


function parseDataFiles(folder){
    let files = fs.readdirSync(`${process.env.DATA_PATH}/${folder}`)
    let data = {}
    for(let file of files){
        data[file.split('.')[0]] = require(`${process.env.DATA_PATH}/${folder}/${file}`)
    }
    return data
}



class TextureRect {
    constructor(x, y, w, h, img) {
        this.x = x
        this.y = y
        this.w = w 
        this.h = h
        this.img = img
    }

    contains(x, y) {
        return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h
    }

    intersects(rect) {
        return this.x + this.w > rect.x && this.x < rect.x + rect.w && this.y + this.h > rect.y && this.y < rect.y + rect.h
        
        //this.contains(rect.x, rect.y) || this.contains(rect.x + rect.w, rect.y) || this.contains(rect.x, rect.y + rect.h) || this.contains(rect.x + rect.w, rect.y + rect.h)
    }

    toUVCoords(maxHeight) {
        this.y = maxHeight - this.y - this.h
    }
}


async function createTextureAtlas(dirPath, atlasName, maxWidth = 512) {
    const files = fs.readdirSync(`${process.env.TEXTURE_PATH}/${dirPath}`)
    if(!fs.existsSync(`${process.env.TEXTURE_PATH}/atlases`)) 
        fs.mkdirSync(`${process.env.TEXTURE_PATH}/atlases`)
    
    const atlases = {
        opaque: [],
        transparent: []
    }

    if(atlasName && !atlases[atlasName])
    atlases[atlasName] = []

    let images = files.map(file => loadImage(`${process.env.TEXTURE_PATH}/${dirPath}/${file}`))
    images = await Promise.all(images).then(images => images.sort((a, b) => b.width * b.height - a.width * a.height))

    let smallest = Math.min(...images.map(img => img.height))

    for(let img of images) {
        let tempCanvas = createCanvas(img.width, img.height)
        let tempCtx = tempCanvas.getContext('2d')
        tempCtx.drawImage(img, 0, 0)
        let data = tempCtx.getImageData(0, 0, img.width, img.height)
        let transparent = data.data.some((v, i) => i % 4 === 3 && v < 255)

        let atlas = atlasName ? atlases[atlasName] : transparent ? atlases.transparent : atlases.opaque

        let x = 0, y = 0, rect
        while(true) {
            rect = new TextureRect(x, y, img.width, img.height, img)
            let intersecting = atlas.find(o => o.intersects(rect))
            if(!intersecting) {
                break
            }
            x = intersecting.x + intersecting.w
            if(x + img.width > maxWidth) {
                x = 0
                y += smallest
            }
        }
        atlas.push(rect)
    }

    for(let atlasName in atlases) {
        const uvs = {}
        let atlas = atlases[atlasName]
        if(!atlas.length) continue

        const maxHeight = Math.max(...atlas.map(o => o.y + o.h))
        const canvas = createCanvas(maxWidth, maxHeight)
        const ctx = canvas.getContext('2d')

        for(let o of atlas) {
            ctx.drawImage(o.img, o.x, o.y, o.w, o.h)
            o.toUVCoords(maxHeight)
            uvs[path.basename(o.img.src, '.png')] = [
                o.x / maxWidth, 
                o.y / maxHeight, 
                (o.x + o.w) / maxWidth, 
                (o.y + o.h) / maxHeight,
            ]
        }
        const data = canvas.toBuffer()
        fs.writeFileSync(`${process.env.TEXTURE_PATH}/atlases/${atlasName}.png`, data)
        fs.writeFileSync(`${process.env.TEXTURE_PATH}/atlases/${atlasName}_uvs.json`, JSON.stringify(uvs, null, 4))
    }
}

module.exports = {
    TextureRect,
    parseDataFiles,
    createTextureAtlas,
}