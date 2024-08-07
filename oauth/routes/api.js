const express = require('express')
const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

router.get('/', (req, res) => res.status(200).json({ success: true }))

router.get('/user', async (req, res) => {
    // Finds and responds with the user corresponding to the access token that was used to make the request
    let accessToken = req.headers.authorization.split(' ')[1]

    const user = (await prisma.token.findFirst({
        where: {
            accessToken: accessToken
        },
        select: {
            user: true
        }
    })).user

    res.status(200).json({
        user_id: user.id,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        type: user.type,
        createdAt: user.createdAt
    })
})

router.get('*', (req, res) => res.status(404).json({ success: false, description: 'Not found!' }))

module.exports = router
