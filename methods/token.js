const crypto = require('crypto');
/**
 *  Generate a token based on input data using a sha256 hash
 *
 * @param {String} input Input data for generating token (may be empty string)
 * @returns {String} Generated token
 */
function generate(input = '') {
	const seed = crypto.randomBytes(256);

	return crypto.createHash('sha256').update(seed).update(input).digest('hex');
}

module.exports = {
	generate: generate,
};
