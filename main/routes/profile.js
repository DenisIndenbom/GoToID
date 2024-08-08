const express = require('express')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

const methods = require('../../methods')

const validate = methods.validate

function auth_handler(req, res, next) { methods.auth(req, res, next, '/login') }

router.get('/my', auth_handler, async function (req, res, next) {
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

router.get('/my/edit', auth_handler, async function (req, res, next) {
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

    return res.render('main/edit_profile.html', {
        base: 'base.html',
        title: 'Profile',
        username: req.session.username,
        fullname: req.session.fullname,
        usertype: req.session.user_type,
        profile: profile,
    })
})

router.post('/my/edit', auth_handler, async function (req, res, next) {
    const username = req.session.username
    const firstName = req.session.firstName
    const lastName = req.session.lastName

    const new_username = req.body.username
    const new_firstName = req.body.firstName
    const new_lastName = req.body.lastName

    const new_email = req.body.email
    const new_telegram = req.body.telegram
    const new_avatarURL = req.body.avatarURL
    const new_about = req.body.about

    // Validate data
    if (!validate.username(new_username) || !validate.email(new_email) || !validate.username(new_telegram) || !validate.user_about(new_about)) {
        return res.redirect('/my/edit?success=false')
    }

    if (username !== new_username || firstName !== new_firstName || lastName !== new_lastName) {
        // pass
    }
})

router.get('/:username', async function (req, res, next) {
    const username = req.params.username

    user = await prisma.user.findFirst({
        where: {
            username: username
        }
    })

    if (!user) {
        return res.redirect('/notfound')
    }

    profile = await prisma.profile.findFirst({
        where: {
            userId: user.id
        }
    })

    if (!profile) {
        return res.redirect('/notfound')
    }

    return res.render('main/profile.html', {
        base: 'base.html',
        title: 'Profile',
        username: user.username,
        fullname: { firstName: user.firstName, lastName: user.lastName },
        usertype: user.type,
        profile: profile,
        is_my: false
    })
})

module.exports = router