const {createReadStream} = require('fs')

const stream = createReadStream('./content/big_file.txt', {highWaterMark: 20000})

stream.on('data', (result) => {
    console.log(result)
})

stream.on('error', (err) => {
    console.log(err)
})

