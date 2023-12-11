const bcrypt = require('bcrypt')

/**
* Hashes a password using bcrypt. This function is async so you can wait for it to complete before returning it
* 
* @param password - The password to hash.
* @param saltRounds - The number of rounds of salt to use.
* 
* @return { Promise } The hashed password or null if there was an error during hashing or if the password is
*/
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

/**
* Compares a password with a hash. Returns false if there is an error. Otherwise returns true. This function is async so you can wait for it to be resolved
* 
* @param password - The password to be compared
* @param hash - The hash to be compared with the password.
* 
* @return { Promise } The result of the bcrypt compare or false if there is an error. Note that the return value is undefined if the password is not the same
*/
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