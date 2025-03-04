const express = require('express');

const prisma = require('../../lib/prisma');
const randToken = require('rand-token').generator({
	source: require('crypto').randomBytes,
});

const router = express.Router(); // Instantiate a new router

const auth_handler = require('../../methods').auth;

// Third party apps pages
router.get('/third_party_apps', auth_handler('/login', true), async function (req, res, next) {
	const clients = await prisma.token.findMany({
		where: {
			userId: req.session.user_id,
			accessTokenExpiresAt: {
				gte: new Date(),
			},
		},
		select: {
			clientId: true,
		},
	});

	return res.render('main/third_party_apps.html', {
		base: 'base.html',
		title: 'Third-party apps',
		apps: clients ? clients : [],
	});
});

// Revoke access
router.get('/third_party_apps/revoke/:clientId', auth_handler('/login'), async function (req, res, next) {
	const clientId = req.params.clientId;

	// Validate data

	// redirect to third party apps if clientId is not set
	if (!clientId) return res.redirect(`/third_party_apps`);

	// Delete tokens
	await prisma.token.deleteMany({
		where: {
			userId: req.session.user_id,
			clientId: clientId,
		},
	});

	return res.redirect('/third_party_apps');
});

// Own apps page
router.get('/own_apps', auth_handler('/login', true), async function (req, res, next) {
	const clients = await prisma.client.findMany({
		where: {
			userId: req.session.user_id,
		},
		select: {
			clientId: true,
			clientSecret: true,
			redirectUris: true,
		},
	});

	return res.render('main/own_apps.html', {
		base: 'base.html',
		title: 'Create App',
		apps: clients ? clients : [],
	});
});

// Create app
router.get('/own_apps/create', auth_handler('/login'), async function (req, res, next) {
	return res.render('main/app.html', {
		base: 'base.html',
		title: 'Create App',
		edit: false,
	});
});

router.post('/own_apps/create', auth_handler('/login', true), async function (req, res, next) {
	const clientId = req.body.app_id;
	const redirectURI = req.body.redirect_uri;

	// Validate data
	if (!clientId || !redirectURI)
		return res.redirect(`/own_apps/create?success=false&app_id=${clientId}&redirect_uri=${redirectURI}`);

	try {
		await prisma.client.create({
			data: {
				clientId: clientId,
				clientSecret: randToken.generate(32),
				redirectUris: [redirectURI],
				grants: ['authorization_code', 'refresh_token'],
				userId: req.session.user_id,
			},
		});
	} catch (e) {
		// If the user is a P2002 or P2002 redirect to the app.
		if (e.code === 'P2002')
			return res.redirect(
				`/own_apps/create?success=false&app_id=${clientId}&redirect_uri=${redirectURI}&unique=false`
			);
		else return res.redirect(`/own_apps/create?success=false`);
	}

	return res.redirect(`/own_apps`);
});

// Edit app
router.get('/own_apps/edit/:clientId', auth_handler('/login', true), async function (req, res, next) {
	const clientId = req.params.clientId;

	// Validate data

	// redirect to the app that is not connected to the server
	if (!clientId) return res.redirect(`/own_apps`);

	client = await prisma.client.findFirst({
		where: {
			clientId: clientId,
			userId: req.session.user_id,
		},
	});

	// redirect to the app s own apps
	if (!client) return res.redirect(`/own_apps`);

	// Render page
	return res.render('main/app.html', {
		base: 'base.html',
		title: 'Edit App',
		app_id: client.clientId,
		redirect_uri: client.redirectUris[0],
		edit: true,
	});
});

router.post('/own_apps/edit/:clientId', auth_handler('/login'), async function (req, res, next) {
	const clientId = req.params.clientId;
	const newClientId = req.body.app_id;
	const redirectURI = req.body.redirect_uri;
	const new_token = req.body.new_token;

	// Validate data

	// redirect to the app that is not connected to the server
	if (!clientId) return res.redirect(`/own_apps`);

	client = await prisma.client.findFirst({
		where: {
			clientId: clientId,
			userId: req.session.user_id,
		},
	});

	// redirect to the app s own apps
	if (!client) return res.redirect(`/own_apps`);

	// redirect to the edit page if the client id is not newClientId or redirectURI is not set.
	if (!newClientId || !redirectURI) return res.redirect(`/own_apps/edit/${clientId}`);

	try {
		// Update client in db
		await prisma.client.update({
			where: {
				clientId: clientId,
			},
			data: {
				clientId: newClientId,
				clientSecret: new_token === 'on' ? randToken.generate(32) : client.clientSecret,
				redirectUris: [redirectURI],
			},
		});
	} catch (e) {
		// redirect to the edit page if the user is a P2002
		if (e.code === 'P2002') return res.redirect(`/own_apps/edit/${clientId}?success=false&unique=false`);
		else return res.redirect(`/own_apps/edit/${clientId}?success=false`);
	}

	return res.redirect(`/own_apps`);
});

// Delete app
router.get('/own_apps/delete/:clientId', auth_handler('/login'), async function (req, res, next) {
	const clientId = req.params.clientId;

	// redirect to own_apps if param is null
	if (!clientId) return res.redirect(`/own_apps`);

	const client = await prisma.client.findFirst({
		where: {
			clientId: clientId,
			userId: req.session.user_id,
		},
	});

	// redirect to own_apps if client does not exist
	if (!client) return res.redirect('/own_apps');

	// delete tokens
	await prisma.token.deleteMany({
		where: {
			clientId: client.clientId,
		},
	});

	// delete client
	await prisma.client.delete({
		where: {
			clientId: client.clientId,
		},
	});

	return res.redirect('/own_apps');
});

module.exports = router;
