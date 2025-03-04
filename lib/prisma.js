const { PrismaClient } = require('@prisma/client');

// Single tone method
if (!global.prisma) {
	global.prisma = new PrismaClient({});
}

module.exports = global.prisma;
