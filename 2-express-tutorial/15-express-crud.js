const express = require('express')
const app = express()
const {people} = require('./data')

app.use(express.static('./methods-public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.post('/login', (req, res) => {
    const {name} = req.body
    if(name){
        res.status(200).send(`Logged In ${req.body.name}`)
    }
    res.status(401).send('Please provide credentials')
})

app.get('/api/people', (req, res) => {
    res.send({data: people})
})

app.post('/api/people', (req, res) => {
    const {name} = req.body
    if(!name){
        res.status(401).send({msg: "Please provide a name"})
    }
    res.status(201).send({person:name})
})

app.put('/api/people/:id', (req, res) => {
    const {id} = req.params
    const {name} = req.body

    const person = people.find((person) => person.id === Number(id))

    if(!person){
        res.status(404).send({msg: `Person with ${id} not found`})
    }
    
    const newPersons = people.map((person) => {
        if(person.id === Number(id)){
            person.name = name
        }
        return person
    })
    res.status(200).send({data:newPersons})
})


app.delete('/api/people/:id', (req, res) => {
    const {id} = req.params

    const person = people.find((person) => person.id === Number(id))

    if(!person){
        res.status(404).send({msg: `Person with ${id} not found`})
    }
    
    const newPersons = people.filter((person) => person.id !== Number(id))
    res.status(200).send({data:newPersons})
})

app.listen(5000)