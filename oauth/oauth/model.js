// See https://oauth2-server.readthedocs.io/en/latest/model/spec.html for what you can do with this
const crypto = require('crypto')
const prisma = require('../../lib/prisma')

module.exports = {
  getClient: async function (clientId, clientSecret) {
    // query db for details with client
    return prisma.client.findFirst(
      {
        where: {
          clientId: clientId,
          // clientSecret: clientSecret,
        }
      }
    )
  },
  saveToken: async (token, client, user) => {
    /* This is where you insert the token into the database */
    const savedToken = await prisma.token.create({
      data: {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.accessToken, // NOTE this is only needed if you need refresh tokens down the line
        refreshTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.clientId,
        userId: user.user,
      }
    })

    return new Promise(resolve => resolve({ ...savedToken, client, user }))
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
        client: true,
        user: true
      }
    })

    const res = foundAccessToken
    res["client"]["id"] = foundAccessToken.clientId
    res["user"] = { user: foundAccessToken.user.id }

    return new Promise(resolve => resolve(foundAccessToken))

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

    const res = foundRefreshToken
    res["client"]["id"] = foundRefreshToken.clientId
    res["user"] = { user: foundRefreshToken.user.id }

    return new Promise(resolve => resolve(foundRefreshToken))
  },
  revokeToken: token => {
    // TODO: Implement this
    /* Delete the token from the database */
    
    if (!token || token === 'undefined') return new Promise(resolve => resolve(false))

    return prisma.token.delete({ where: { refreshToken: token.refreshToken } })
      .then(function (token) {
        return !!token;
      });
  },
  generateAuthorizationCode: (client, user, scope, callback) => {
    /* generate authroization code */

    const err = null;
    const seed = crypto.randomBytes(256)
    const code = crypto
      .createHash('sha1')
      .update(seed)
      .digest('hex')
    return callback(err, code);
  },
  saveAuthorizationCode: async (code, client, user) => {
    /* This is where you store the access code data into the database */

    return prisma.authCode.create({
      data: {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        clientId: client.clientId,
        userId: user.user,
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
        // redirectUri: true,
        clientId: true,
        client: true,
        user: true
      }
    })

    const res = authCode
    res["client"]["redirectUri"] = [authCode.client.redirectUris]
    res["user"] = { user: authCode.user.id }

    return new Promise(resolve => resolve(res))
  },
  revokeAuthorizationCode: async code => {
    /* This is where we delete codes */
    
    return prisma.authCode.delete({ where: { authorizationCode: code.authorizationCode } })
      .then(function (authorizationCode) {
        return !!authorizationCode;
      });
  },
  verifyScope: (token, scope) => {
    /* This is where we check to make sure the client has access to this scope */

    const userHasAccess = true  // return true if this user / client combo has access to this resource
    return new Promise(resolve => resolve(userHasAccess))
  }
}