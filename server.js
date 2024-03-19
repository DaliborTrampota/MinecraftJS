const express = require('express')
const path = require('path')
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas')

const app = express()

async function test(req, res, next) {
    // console.log(req.path)
    next()
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();   
})
app.use('/src', test, express.static(__dirname + '/src'));
//app.use('/resources', express.static(__dirname + '/public/resources'))
//app.use('/public', express.static(__dirname + '/public'))
//app.use('/node_modules', express.static(__dirname + '/node_modules'))

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));


app.get('/blockData', (req, res) => {
    let itemData = getJsonFiles('data/blocks')
    res.send(itemData)
})
app.get('/itemData', (req, res) => {
    let itemData = getJsonFiles('data/items')
    res.send(itemData)
})

app.get('/lootTables', (req, res) => {
    let itemData = getJsonFiles('lootTables')
    res.send(itemData)
})

app.get('/textures', (req, res) => {
    res.send({
        atlases: {
            opaque: './resources/textures/atlases/opaque.png',
            transparent: './resources/textures/atlases/transparent.png',
            liquids: './resources/textures/atlases/liquids.png',
            entities: './resources/textures/atlases/entities.png',
        },
        uvs: {
            opaque: require('./public/resources/textures/atlases/opaque_uvs.json'),
            transparent: require('./public/resources/textures/atlases/transparent_uvs.json'),
            liquids: require('./public/resources/textures/atlases/liquids_uvs.json'),
            entities: require('./public/resources/textures/atlases/entities_uvs.json'),
        },
    })
})

app.get('/recipes', (req, res) => {
    let itemData = getJsonFiles('recipes')
    res.send(itemData)
})


app.get('/entities', (req, res) => {
    let entitiesData = getJsonFiles('data/entities')
    res.send(entitiesData)
})

app.listen(8000, null, null, () => console.log("The local server is up and running!", `http://localhost:${8000}`));

function getJsonFiles(path){
    let files = fs.readdirSync(`./public/resources/${path}`)
    let data = {}
    for(let file of files){
        data[file.split('.')[0]] = require(`./public/resources/${path}/${file}`)
    }
    return data
}



async function createTextureAtlas(dirPath, atlasName, maxWidth = 512) {
    const files = fs.readdirSync(dirPath)
    if(!fs.existsSync(`./public/resources/textures/atlases`)) 
        fs.mkdirSync(`./public/resources/textures/atlases`)
    
    const atlases = {
        opaque: [],
        transparent: []
    }

    if(atlasName && !atlases[atlasName])
    atlases[atlasName] = []

    let images = files.map(file => loadImage(`${dirPath}/${file}`))
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
        fs.writeFileSync(`./public/resources/textures/atlases/${atlasName}.png`, data)
        fs.writeFileSync(`./public/resources/textures/atlases/${atlasName}_uvs.json`, JSON.stringify(uvs, null, 4))
    }
}

async function main() {
    console.time('Creating texture atlases')
    await createTextureAtlas('./public/resources/textures/blocks')
    await createTextureAtlas('./public/resources/textures/liquids', 'liquids')
    await createTextureAtlas('./public/resources/textures/entities', 'entities', 64)
    console.timeEnd('Creating texture atlases')
}
main()


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

// let r1 = new TextureRect(5, 5, 10, 100)
// let r2 = new TextureRect(0, 10, 100, 10)
// console.log(r2.intersects(r1))