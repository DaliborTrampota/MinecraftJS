const express = require('express')
const path = require('path')
const fs = require('fs');

const app = express()

app.use('/src', express.static(__dirname + '/src'));
app.use('/resources', express.static(__dirname + '/src/resources'))
//app.use('/node_modules', express.static(__dirname + '/node_modules'))
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
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
    res.send(fs.readdirSync('./src/resources/textures/blocks'))
})

app.listen(8000, null, null, () => console.log("The Local Dashboard server is up and running!"));

function getJsonFiles(path){
    let files = fs.readdirSync(`./src/resources/${path}`)
    let data = {}
    for(let file of files){
        data[file.split('.')[0]] = require(`./src/resources/${path}/${file}`)
    }
    return data
}