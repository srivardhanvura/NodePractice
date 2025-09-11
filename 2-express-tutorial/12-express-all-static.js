const express = require('express')
const path = require('path')
const app = express()

app.use(express.static('./public'))


// if index.html is placed in ./public we don't need to handle this home page!
app.get('/', (req, res) => {
    console.log('user hit home page')
    res.sendFile(path.resolve(__dirname, './navbar-app/index.html'))
})

app.use((req, res) => {
    console.log('user hit an invalid page')
    res.status(404).send('Resource not found')
})

app.listen(5000, ()=>{
    console.log('Listening on port 5000')
})