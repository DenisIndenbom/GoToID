const express = require('express');

const prisma = require('../../lib/prisma');

const hashPassword = require('../../methods').passwordHashing.hashPassword;
const validate = require('../../methods').validate;

const router = express.Router(); // Instantiate a new router

router.get('/', (req, res) => {
	// send back a simple form for the auth
	return res.render('authorization/register.html', {
		base: 'base.html',
		title: 'Register',
	});
});

router.post('/', async (req, res) => {
	const username = req.body.username;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const password = req.body.password;
	const inviteCode = req.body.invite_code;

	const back = req.query.back;

	// save url params
	const params =
		`&username=${username}&firstName=${firstName}&lastName=${lastName}` + (back ? `&back=${back}` : '');

	if (!username || !password || !inviteCode || !firstName || !lastName)
		return res.redirect(`/register?success=false${params}&invite_code=${inviteCode}`);

	if (
		!validate.username(username) ||
		!validate.password(password) ||
		!validate.invite_code(inviteCode) ||
		!validate.name(firstName) ||
		!validate.name(lastName)
	)
		return res.redirect(`/register?success=false${params}&invite_code=${inviteCode}`);

	const invite = await prisma.inviteCode.findFirst({
		where: {
			code: inviteCode,
			expiresAt: {
				gte: new Date(),
			},
		},
	});

	if (!invite) return res.redirect(`/register?success=false${params}&wrong_code=true`);

	// create new user in db
	let user;
	try {
		user = await prisma.user.create({
			data: {
				username: username,
				firstName: firstName,
				lastName: lastName,
				type: invite.account_type,
				password: await hashPassword(password),
			},
		});
	} catch (e) {
		// handle error of not unique
		if (e.code === 'P2002')
			return res.redirect(`/register?success=false${params}&invite_code=${inviteCode}&unique=false`);
		else return res.redirect(`/register?success=false${params}&invite_code=${inviteCode}`);
	}

	// login user
	req.session.user_id = user.id;
	req.session.username = user.username;
	req.session.fullname = { firstName: firstName, lastName: lastName };
	req.session.user_type = user.type;

	return res.redirect(back ? decodeURIComponent(back) : '/');
});

module.exports = router;
