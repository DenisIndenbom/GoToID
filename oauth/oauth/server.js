const OAuthServer = require('express-oauth-server');
const model = require('./model');

// Single tone method
if (!global.oauth_server) {
	global.oauth_server = new OAuthServer({
		model: model,
		grants: ['authorization_code', 'refresh_token'],
		accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
		allowEmptyState: true,
		allowExtendedTokenAttributes: true,
	});
}

module.exports = global.oauth_server;
