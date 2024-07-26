const express = require('express')
const path = require('path')

const app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();   
})

app.use('/', express.static(path.join(__dirname)))

app.listen(3000, null, null, () => console.log("The local server is up and running!", `http://localhost:${3000}`));