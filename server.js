const express = require('express')
const path = require('path')
const fs = require('fs');

const app = express()

app.use('/src', express.static(__dirname + '/src'));
app.use('/resources', express.static(__dirname + '/src/resources'))
app.use('/node_modules', express.static(__dirname + '/node_modules'))
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/blockData', (req, res) => {

    let allBlocks = fs.readdirSync('./src/resources/data/blocks')
    let blockData = {}
    for(let block of allBlocks){
        blockData[block.split('.')[0]] = require(`./src/resources/data/blocks/${block}`)
    }
    res.send(blockData)
})
app.get('/textures', (req, res) => {
    res.send(fs.readdirSync('./src/resources/textures/blocks'))
})

app.listen(8000, null, null, () => console.log("The Local Dashboard server is up and running!"));