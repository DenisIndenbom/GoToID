// See https://oauth2-server.readthedocs.io/en/latest/model/spec.html for what you can do with this
const crypto = require('crypto')
const prisma = require('../../lib/prisma')

const VALID_SCOPES = ['user', 'email', 'telegram', 'avatar']

module.exports = {
    getClient: async function (clientId, clientSecret) {
        // query db for details with client
        if (clientId)
            return prisma.client.findFirst(
                {
                    where: {
                        clientId: clientId,
                    }
                }
            )
        else if (clientSecret)
            return prisma.client.findFirst(
                {
                    where: {
                        clientSecret: clientSecret,
                    }
                }
            )
        else
            return null
    },
    saveToken: async (token, client, user) => {
        /* This is where you insert the token into the database */
        const savedToken = await prisma.token.create({
            data: {
                accessToken: token.accessToken,
                accessTokenExpiresAt: token.accessTokenExpiresAt,
                refreshToken: token.accessToken, // NOTE this is only needed if you need refresh tokens down the line
                refreshTokenExpiresAt: token.accessTokenExpiresAt,
                scope: token.scope,
                clientId: client.clientId,
                userId: user.id,
            }
        })

        return { ...savedToken, client, user }
    },
    getAccessToken: async accessToken => {
        /* This is where you select the token from the database where the code matches */
        if (!accessToken || accessToken === 'undefined') return false

        const foundAccessToken = await prisma.token.findFirst({
            where: {
                accessToken: accessToken
            },
            select: {
                accessToken: true,
                accessTokenExpiresAt: true,
                refreshToken: true,
                refreshTokenExpiresAt: true,
                scope: true,
                client: true,
                user: true
            }
        })

        return foundAccessToken

    },
    getRefreshToken: async token => {
        /* Retrieves the token from the database */

        const foundRefreshToken = await prisma.token.findFirst({
            where: {
                refreshToken: token
            },
            select: {
                accessToken: true,
                accessTokenExpiresAt: true,
                refreshToken: true,
                refreshTokenExpiresAt: true,
                client: true,
                user: true
            }
        })

        return foundRefreshToken
    },
    revokeToken: async token => {
        /* Delete the token from the database */

        if (!token || token === 'undefined') return new Promise(resolve => resolve(false))

        return !!(await prisma.token.delete({ where: { refreshToken: token.refreshToken } }))
    },
    generateAuthorizationCode: (client, user, scope, callback) => {
        /* generate authroization code */

        const err = null
        const seed = crypto.randomBytes(256)
        const code = crypto
            .createHash('sha1')
            .update(seed)
            .digest('hex')

        return callback(err, code)
    },
    saveAuthorizationCode: async (code, client, user) => {
        /* This is where you store the access code data into the database */

        return await prisma.authCode.create({
            data: {
                authorizationCode: code.authorizationCode,
                expiresAt: code.expiresAt,
                redirectUri: code.redirectUri,
                scope: code.scope,
                clientId: client.clientId,
                userId: user.id,
                redirectUri: code.redirectUri
            }
        })
    },
    getAuthorizationCode: async (authorizationCode) => {
        /* this is where we fetch the stored data from the code */

        const authCode = await prisma.authCode.findFirst({
            where: {
                authorizationCode: authorizationCode
            },
            select: {
                authorizationCode: true,
                expiresAt: true,
                scope: true,
                clientId: true,
                client: true,
                user: true
            }
        })

        return authCode
    },
    revokeAuthorizationCode: async code => {
        /* This is where we delete codes */

        return !!(await prisma.authCode.delete({ where: { authorizationCode: code.authorizationCode } }))
    },
    validateScope: (user, client, scope) => {
        if (scope === '') return 'user'

        return scope
            .split(' ')
            .filter(s => VALID_SCOPES.indexOf(s) >= 0)
            .join(' ')
    },
    verifyScope: (token, scope) => {
        /* This is where we check to make sure the client has access to this scope */

        if (!token.scope)
            return false

        let requestedScopes = scope.split(' ')
        let authorizedScopes = token.scope.split(' ')

        return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0)
    }
}