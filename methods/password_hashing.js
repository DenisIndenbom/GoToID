const bcrypt = require('bcrypt')

async function hashPassword(password, saltRounds = 11) {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds)

        // Hash password
        return await bcrypt.hash(password, salt)
    } catch (error) {
        console.log(error)
    }

    // Return null if error
    return null
}

async function comparePassword(password, hash) {
    try {
        // Compare password
        return await bcrypt.compare(password, hash)
    } catch (error) {
        console.log(error)
    }

    // Return false if error
    return false
}


module.exports = {
    hashPassword: hashPassword,
    comparePassword: comparePassword
}