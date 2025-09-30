import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import prisma from './prisma.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

const signToken = (user) => {
    return jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_KEY,
        { expiresIn: 900 }
    )
};

const verifyTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('JWT ') ? authHeader.slice(4) : null;

    if(!token) throw new Error('Missing token');

    try{
        return jwt.verify(token, process.env.JWT_KEY)
    }
    catch{
        throw new Error('Invalid or expired token');
    }
}

router.post('/register', async (req, res) => {
    const {email, password, name} = req.body || {};
    
    if(!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try{
        const hashed_password = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {email: email.toLowerCase(), password: hashed_password, name}
        });

        const token = signToken(user)

        return res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt }
            });
    }
    catch(e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError){
            if(e.code == 'P2002'){
                return res.status(409).json({ error: `Unique constraint on: ${fields}` });
            }
        }
        console.error(e);
        return res.status(500).json({ error: 'Server error' });
    }
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body || {};
    
    if(!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

        if(!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken(user);

        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt }
            });
    } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
})

router.get('/me', async (req, res) => {
    
    try{
        const payload = verifyTokenFromHeader(req)
        const me = await prisma.user.findUnique({
            where: {id: payload.sub},
            select: { id: true, email: true, name: true, createdAt: true }
        })
        if (!me) return res.status(404).json({ error: 'User not found' });
        return res.json({ user: me });
    }
    catch(e){
        return res.status(401).json({ error: e.message });
    }
})

export default router;