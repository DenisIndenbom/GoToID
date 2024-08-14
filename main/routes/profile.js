const express = require('express')

const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

const methods = require('../../methods')

const auth_handler = methods.auth
const validate = methods.validate

router.get('/my', auth_handler('/login'), async function (req, res, next) {
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

router.get('/my/edit', auth_handler('/login'), async function (req, res, next) {
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

router.post('/my/edit', auth_handler('/login'), async function (req, res, next) {
    const username = req.session.username
    const firstName = req.session.fullname.firstName
    const lastName = req.session.fullname.lastName

    const new_username = req.body.username
    const new_firstName = req.body.firstName
    const new_lastName = req.body.lastName

    const new_email = req.body.email
    const new_telegram = req.body.telegram
    const new_avatarURL = req.body.avatarURL
    const new_about = req.body.about

    const params = `&email=${new_email}&telegram=${new_telegram}&avatarURL=${new_avatarURL}`

    // Validate data
    if (!new_username || !new_firstName || !new_lastName) {
        return res.redirect('/profile/my/edit')
    }

    if (!validate.username(new_username) || !validate.name(new_lastName) || !validate.name(new_firstName) ||
        !(validate.email(new_email) || !new_email) ||
        !(validate.username(new_telegram) || !new_telegram) ||
        !(validate.user_about(new_about) || !new_about) ||
        !(validate.url(new_avatarURL) || !new_avatarURL)) {

        return res.redirect(`/profile/my/edit?success=false${params}`)
    }

    // Check defferents
    if (username !== new_username || firstName !== new_firstName || lastName !== new_lastName) {
        try {
            // Update user in db
            await prisma.user.update({
                where: {
                    id: req.session.user_id
                },
                data: {
                    username: new_username,
                    firstName: new_firstName,
                    lastName: new_lastName
                }
            })
        }
        catch (e) {
            // redirect to the edit page if the user is a P2002
            if (e.code === 'P2002')
                return res.redirect(`/profile/my/edit?success=false${params}&unique=false`)
            else
                return res.redirect(`/profile/my/edit?success=false`)
        }

        req.session.username = new_username
        req.session.fullname = { firstName: new_firstName, lastName: new_lastName }
    }

    try {
        // Update profile in db
        await prisma.profile.update({
            where: {
                userId: req.session.user_id
            },
            data: {
                email: new_email,
                telegram: new_telegram,
                avatarURL: new_avatarURL,
                about: new_about
            }
        })
    }
    catch (e) {
        // redirect to the edit page if the user is a P2002
        if (e.code === 'P2002')
            return res.redirect(`/profile/my/edit?success=false${params}&unique_tg=false`)
        else
            return res.redirect(`/profile/my/edit?success=false`)
    }

    req.session.avatar_url = new_avatarURL

    return res.redirect('/profile/my')
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