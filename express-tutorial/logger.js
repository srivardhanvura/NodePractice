const logger = (req, res, next) => {
    console.log('hi from middleware')
    const method = req.method
    const url = req.url
    const date = new Date().getFullYear()
    console.log(method, url, date)
    next()
}

module.exports = logger
