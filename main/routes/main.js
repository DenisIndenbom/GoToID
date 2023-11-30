const path = require('path') // has path and __dirname
const express = require('express')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

router.get('/', async function (req, res, next) {
    res.render('main/main.html', {
        base: 'base.html',
        title: 'Main',
        username: (req.session && req.session.username) ? req.session.username : 'gotoman'
    })
})

router.get('/third_party_apps', async function (req, res, next) {
    const clients = await prisma.token.findMany({
        where: {
            userId: req.session.user_id
        },
        select: {
            clientId: true,
        }
    })
    
    res.render('main/third_party_apps.html', {
        base: 'base.html',
        title: 'Third-party apps',
        apps: clients ? clients : []
    })
})

module.exports = router