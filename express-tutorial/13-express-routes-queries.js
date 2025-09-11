const express = require('express')
const {products} = require('./data')
const app = express()

app.get('/', (req, res) => {
    res.send('<h1>Welcome to Home Page</h1><a href="/api/products">Products</a>')
})

app.get('/api/products', (req, res) => {
    const newProducts = products.map((product) => {
        const {id, name} = product;
        return {id, name}
    })
    res.json(newProducts)
})

app.get('/api/products/:productId', (req, res) => {
    const {productId} = req.params
    const singleProduct = products.find((product) => product.id == productId)

    if(singleProduct == null){
        return res.status(404).send("Product does not exist")
    }
    else{
        res.json(singleProduct)
    }
})


app.get('/api/v1/query', (req, res) => {
    const {search, limit} = req.query
    let sortedProducts = [...products]

    if(search){
        sortedProducts = sortedProducts.filter((product) => {
            return product.name.startsWith(search)
        })
    }

    if(limit){
        sortedProducts = sortedProducts.slice(0, Number(limit))
    }

    if(sortedProducts.length < 1){
        return res.status(200).send('No products found')
    }

    res.status(200).json(sortedProducts)
})

app.listen(5000, () => {
    console.log('Listening on port 5000')
})
