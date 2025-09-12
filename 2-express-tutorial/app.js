const express = require('express')
const app = express()
const people = require('./routes/people.js')
const auth = require('./routes/auth.js')

app.use(express.static('./methods-public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())


app.use('/api/people', people)
app.use('/login', auth)

app.listen(5000)