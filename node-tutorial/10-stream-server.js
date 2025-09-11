const fs = require('fs')
const http = require('http')

http.createServer(function (req, res) {
    // const content = fs.readFileSync('./content/big_file.txt', 'utf8')
    // res.end(content)

    const stream = fs.createReadStream('./content/big_file.txt', 'utf8')
    stream.on('open', () => {
        stream.pipe(res)
    })
    stream.on('error', (err) => {
        res.end(err)
    })

}).listen(5000)
