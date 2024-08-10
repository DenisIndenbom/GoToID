const express = require('express')
const prisma = require('../../lib/prisma')

const router = express.Router() // Instantiate a new router

function get_token(req) {
    // Finds and responds with the user corresponding to the access token that was used to make the request
    return req.headers.authorization.split(' ')[1]
}

router.get('/', (req, res) => res.status(200).json({ success: true }))

router.get('/user', async (req, res) => {
    let accessToken = get_token(req)

    const user = (await prisma.token.findFirst({
        where: {
            accessToken: accessToken
        },
        select: {
            user: true
        }
    })).user

    return res.status(200).json({
        user_id: user.id,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        type: user.type,
        createdAt: user.createdAt
    })
})

router.get('/email', async (req, res) => {
    let accessToken = get_token(req)

    const email = (await prisma.token.findFirst({
        where: {
            accessToken: accessToken
        },
        select: {
            user: {
                select: {
                    Profile: {
                        select: {
                            email: true
                        }
                    }
                }
            }
        }
    })).user.Profile.email

    return res.status(200).json({ email: email })
})

router.get('/telegram', async (req, res) => {
    let accessToken = get_token(req)

    const telegram = (await prisma.token.findFirst({
        where: {
            accessToken: accessToken
        },
        select: {
            user: {
                select: {
                    Profile: {
                        select: {
                            telegram: true
                        }
                    }
                }
            }
        }
    })).user.Profile.telegram

    return res.status(200).json({ telegram: telegram })
})

router.get('/avatar', async (req, res) => {
    let accessToken = get_token(req)

    const avatar = (await prisma.token.findFirst({
        where: {
            accessToken: accessToken
        },
        select: {
            user: {
                select: {
                    Profile: {
                        select: {
                            avatarURL: true
                        }
                    }
                }
            }
        }
    })).user.Profile.avatarURL

    return res.status(200).json({ avatar: avatar })
})

router.get('*', (req, res) => res.status(404).json({ success: false, description: 'Not found!' }))

module.exports = router
