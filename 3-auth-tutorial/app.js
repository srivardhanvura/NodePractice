import express from 'express'
import 'dotenv/config';
import authRouter from './auth.js';

const app = express()

app.use(express.json())

app.post('/login', (req, res) => {
    res.json({'message': 'home'})

});

app.use('/auth', authRouter)

app.listen(5000);