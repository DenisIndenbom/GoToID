const express = require('express')

const prisma = require('../../lib/prisma')

const hashPassword = require('../../methods').passwordHashing.hashPassword
const comparePassword = require('../../methods').passwordHashing.comparePassword

const router = express.Router() // Instantiate a new router

const methods = require('../../methods')

function auth_handler(req, res, next) { methods.auth(req, res, next, '/login') }

router.get('/', auth_handler, async (req, res) => {
    return res.render('authorization/change_password.html', {
        base: 'base.html',
        title: 'Change Password',
    })
})

router.post('/', auth_handler, async (req, res) => {
    const old_password = req.body.old_password
    const new_password = req.body.new_password

    // Redirect to change_password if old_password or new_password is not set
    if (!old_password || !new_password) return res.redirect(`/change_password?success=false`)
    
    // Find user
    const user = await prisma.user.findFirst({
        where: {
            username: req.session.username
        }
    })

    // Check password
    const correct_password = user ? await comparePassword(new_password, user.password) : false

    // Redirect to change_password if user is not set
    if (!user || !correct_password)
        return res.redirect(`/change_password?success=false&old_password=${old_password}${!correct_password ? '&wrong_password=true' : ''}`)

    // Update password
    const update_user = await prisma.user.update({
        where: {
            username: req.session.username
        },
        data: {
            password: await hashPassword(new_password)
        }
    })

    //Rredirect to change_password if update_user is null
    if (!update_user)
        return res.redirect(`/change_password?success=false&old_password=${old_password}${!correct_password ? '&wrong_password=true' : ''}`)

    return res.redirect('/')
})

module.exports = router