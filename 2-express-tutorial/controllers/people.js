const {people} = require('../data')

const getPerson = (req, res) => {
    res.send({data: people})
}

const createPerson = (req, res) => {
    const {name} = req.body
    if(!name){
        res.status(401).send({msg: "Please provide a name"})
    }
    res.status(201).send({person:name})
}

const updatePerson = (req, res) => {
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
}

const deletePerson = (req, res) => {
    const {id} = req.params

    const person = people.find((person) => person.id === Number(id))

    if(!person){
        res.status(404).send({msg: `Person with ${id} not found`})
    }
    
    const newPersons = people.filter((person) => person.id !== Number(id))
    res.status(200).send({data:newPersons})
}


module.exports = {
    getPerson,
    createPerson, 
    updatePerson,
    deletePerson
}