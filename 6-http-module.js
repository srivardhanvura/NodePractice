const http = require('http')

const server = http.createServer((req, res) => {
    if(req.url == '/home' || req.url == '/'){
        res.end('Hello from the home page')
    }
    else if(req.url == '/about'){
        res.end('Hello from the about page')
    }
    else{
        res.end(`
            <h1> Oops </h1>
            <p>We cant find the page you are looking for!</p>
            <a href='/'> back home </a>
            `)
    }
})

server.listen(5000)