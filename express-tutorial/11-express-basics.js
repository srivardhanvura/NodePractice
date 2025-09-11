const express = require('express')
const app = express()

// app.get
// app.post
// app.put
// app.delete
// app.all
// app.use
// app.listen


app.get('/', (req, res) => {
    console.log('user hit home page')
    res.send('Home Page')
})

app.get('/about', (req, res) => {
    console.log('user hit about page')
    res.status(200).send('About Page')
})

app.use((req, res) => {
    console.log('user hit an invalid page')
    res.status(404).send('<h1>resource not found</h1>')
})

app.listen(5000, () => {
    console.log('server is listening on 5000')
})