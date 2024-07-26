const express = require('express')
const path = require('path')
const https = require('https')
const fs = require('fs');
const { parseDataFiles, createTextureAtlas } = require('./utils');


const app = express()
const PORT = 8000
const local = false

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();   
})

app.use('/textures', express.static(path.join(__dirname, process.env.TEXTURE_PATH)))
app.use('/shaders', express.static(path.join(__dirname, process.env.SHADER_PATH)))
// app.use('/resources', express.static(__dirname + '/resources'))
// app.use('/', express.static(__dirname + '/public/build'));

// app.use('/shaders', express.static(path.join(__dirname, process.env.SHADER_PATH)))


const dataFolders = fs.readdirSync(process.env.DATA_PATH)
for(let folder of dataFolders) {
    console.info('Registering data folder:', folder)
    app.get(`/data/${folder}`, (req, res) => {
        res.send(parseDataFiles(folder))
    })
}

app.get('/atlases/:file', (req, res) => {
    res.sendFile(path.join(__dirname, process.env.TEXTURE_PATH, 'atlases', req.params.file))
})


app.get('/atlases', (req, res) => {
    const data = fs.readdirSync(`${process.env.TEXTURE_PATH}/atlases`).reduce((obj, file) => { 
        const name = file.replace(/(_uvs)?\.(png|json)/, '')
        if(file.endsWith('png')) obj.atlases[name] = `/atlases/${file}`
        else obj.uvs[name] = require(`${process.env.TEXTURE_PATH}/atlases/${file}`)
        return obj
    }, { atlases: {}, uvs: {} })

    res.send({
        ...data,
        items: fs.readdirSync(`${process.env.TEXTURE_PATH}/items`).map(item => `textures/items/${item}`)
    })
})



if(local) {
    app.listen(PORT, null, null, () => console.log("The local server is up and running!", `http://localhost:${PORT}`));
} else {
    const server = https.createServer({
        key: fs.readFileSync('/etc/sslcert/privkey.key'),
        cert: fs.readFileSync('/etc/sslcert/origin.pem'),
    }, app)
    
    server.listen(PORT, () => {
        console.log(`HTTPS Server running on port ${PORT}`)
    })
}


async function main() {
    console.time('Creating texture atlases')
    await createTextureAtlas('blocks')
    await createTextureAtlas('liquids', 'liquids')
    await createTextureAtlas('entities', 'entities')
    console.timeEnd('Creating texture atlases')
}
main()



// let r1 = new TextureRect(5, 5, 10, 100)
// let r2 = new TextureRect(0, 10, 100, 10)
// console.log(r2.intersects(r1))