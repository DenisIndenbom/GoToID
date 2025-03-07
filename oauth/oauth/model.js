const token = require('../../methods').token;
const prisma = require('../../lib/prisma');

const VALID_SCOPES = ['user', 'email', 'telegram', 'avatar'];

/**
 * Generate a token based on client, user and scope data using a sha256 hash
 *
 * @param {Object} client The client for whom the token is being generated
 * @param {Object} user The user for whom the token is being generated
 * @param {String[]} scope The scopes associated with the token
 *
 * @returns {String} Generated token
 */
async function generate_token(client, user, scope) {
	const input = `${client.clientId}:${user.id}:${scope.join(',')}:${Date.now()}`;

	return token.generate(input);
}

module.exports = {
	getClient: async (client_id, client_secret) => {
		// Query db for details with client

		return await prisma.client.findFirst({
			where: client_id ? { clientId: client_id } : { clientSecret: client_secret },
			omit: {
				clientSecret: true,
				userId: true,
			},
		});
	},
	saveToken: async (token, client, user) => {
		/* This is where you insert the token into the database */
		const saved_token = await prisma.token.create({
			data: {
				accessToken: token.accessToken,
				accessTokenExpiresAt: token.accessTokenExpiresAt,
				refreshToken: token.accessToken,
				refreshTokenExpiresAt: token.accessTokenExpiresAt,
				scope: token.scope.join(' '),
				clientId: client.clientId,
				userId: user.id,
			},
		});

		saved_token.scope = saved_token.scope.split(' ');

		return { ...saved_token, client, user };
	},
	generateAccessToken: generate_token,
	getAccessToken: async (token) => {
		/* This is where you select the token from the database where the code matches */
		if (!token || token === 'undefined') return false;

		const token_data = await prisma.token.findFirst({
			where: {
				accessToken: token,
			},
			select: {
				accessToken: true,
				accessTokenExpiresAt: true,
				refreshToken: true,
				refreshTokenExpiresAt: true,
				scope: true,
				client: true,
				user: true,
			},
		});

		token_data.scope = token_data.scope.split(' ');

		return token_data;
	},
	generateRefreshToken: generate_token,
	getRefreshToken: async (token) => {
		/* Retrieves the token from the database */

		const token_data = await prisma.token.findFirst({
			where: {
				refreshToken: token,
			},
			select: {
				accessToken: true,
				accessTokenExpiresAt: true,
				refreshToken: true,
				refreshTokenExpiresAt: true,
				client: {
					omit: {
						clientSecret: true,
						userId: true,
					},
				},
				user: {
					select: {
						id: true,
					},
				},
			},
		});

		return token_data;
	},
	revokeToken: async (token) => {
		/* Delete the token from the database */

		if (!token || token === 'undefined') return false;

		return !!(await prisma.token.delete({ where: { refreshToken: token.refreshToken } }));
	},
	generateAuthorizationCode: generate_token,
	saveAuthorizationCode: async (code, client, user) => {
		/* This is where you store the access code data into the database */

		return await prisma.authCode.create({
			data: {
				authorizationCode: code.authorizationCode,
				expiresAt: code.expiresAt,
				redirectUri: code.redirectUri,
				scope: code.scope.join(' '),
				clientId: client.clientId,
				userId: user.id,
				redirectUri: code.redirectUri,
			},
		});
	},
	getAuthorizationCode: async (code) => {
		/* This is where we fetch the stored data from the code */

		const code_data = await prisma.authCode.findFirst({
			where: {
				authorizationCode: code,
			},
			select: {
				authorizationCode: true,
				expiresAt: true,
				scope: true,
				clientId: true,
				client: {
					omit: {
						clientSecret: true,
						userId: true,
					},
				},
				user: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!code_data) return null;

		code_data.scope = code_data.scope.split(' ');

		return code_data;
	},
	revokeAuthorizationCode: async (code) => {
		/* This is where we delete codes */

		return !!(await prisma.authCode.delete({ where: { authorizationCode: code.authorizationCode } }));
	},
	validateScope: (user, client, scope) => {
		/* This is where we check if this is a valid scope. */
		return scope.filter((s) => VALID_SCOPES.indexOf(s) >= 0);
	},
	verifyScope: (token, scope) => {
		/* This is where we check if the client has access to this scope. */

		if (!token.scope) return false;

		return scope.every((s) => token.scope.indexOf(s) >= 0);
	},
};
