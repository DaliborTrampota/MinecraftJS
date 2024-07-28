const express = require('express')
const path = require('path')
const https = require('https')
const fs = require('fs')

const app = express()
const PORT = 3030
const local = false

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();   
})

app.use('/', express.static(path.join(__dirname)))

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
