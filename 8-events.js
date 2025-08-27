const EventEmitter = require('events')

const customEmitter = new EventEmitter()

customEmitter.on('response', () => {
    console.log('Data received')
})

customEmitter.on('response', (data) => {
    console.log(`Data received: ${data}`)
})

customEmitter.on('response', (data, id) => {
    console.log(`Data received: ${data} and id: ${id}`)
})

customEmitter.emit('response', 'Hi')