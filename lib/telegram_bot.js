// More crutches to the God of crutches!
function start_polling() {
    if (typeof global.is_main !== 'undefined') {
        if (global.is_main)
            global.tgbot.startPolling()
    }
    else {
        setTimeout(() => {
            start_polling();
        }, 1000)
    }
}

// Init telegram bot
if (!global.tgbot) {
    const TelegramBot = require('node-telegram-bot-api')
    const prisma = require('./prisma.js')
    const parse_args = require('yargs-parser')

    const randToken = require('rand-token').generator({
        source: require('crypto').randomBytes
    })

    const config = global.config
    const admins = config.TG_ADMINS.split(' ')
    const tgbot = new TelegramBot(config.TG_TOKEN, { polling: false })

    tgbot.onText(/\/start/, async (msg) => {
        if (!admins.includes(msg.from.id.toString())) return

        var message = `Hello, I'm a GoToID bot! I'll help you with the admin tasks!`

        tgbot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' })
    })

    tgbot.onText(/\/gen_invite_code/, async (msg) => {
        if (!admins.includes(msg.from.id.toString())) return

        const args = parse_args(msg.text)._

        if (args.length <= 1) return

        try {
            const invite_code = await prisma.InviteCode.create({
                data: {
                    code: randToken.generate(4),
                    expiresAt: new Date(Date.parse(args[1]))
                }
            })

            tgbot.sendMessage(msg.chat.id, 'Invite code: ' + '`' + invite_code.code + '`', {parse_mode: 'Markdown'})
        }
        catch (e) {
            tgbot.sendMessage(msg.chat.id, 'Incorrect args!')
        }
    })

    tgbot.onText(/\/del_invite_code/, async (msg) => {
        if (!admins.includes(msg.from.id.toString())) return

        const args = parse_args(msg.text)._

        if (args.length <= 1) return

        try {
            await prisma.InviteCode.delete({
                where: {
                    code: args[1]
                }
            })

            tgbot.sendMessage(msg.chat.id, 'Invite code was deleted!', { parse_mode: 'Markdown' })
        }
        catch (e) {
            tgbot.sendMessage(msg.chat.id, 'Incorrect args!')
        }
    })

    global.tgbot = tgbot
    start_polling()
}


module.exports = global.tgbot;