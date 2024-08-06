const express = require('express')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

const methods = require('../../methods')

function auth_handler(req, res, next) { methods.auth(req, res, next, '/login') }

router.get('/', auth_handler, async function (req, res, next) {
    profile = await prisma.profile.findFirst({
        where: {
            userId: req.session.user_id
        }
    })

    if (!profile) {
        profile = await prisma.profile.create({
            data: {
                userId: req.session.user_id
            }
        })
    }

    return res.render('main/profile.html', {
        base: 'base.html',
        title: 'Profile',
        username: req.session.username,
        fullname: req.session.fullname,
        usertype: req.session.user_type,
        profile: profile,
        is_my: true
    })
})

module.exports = router