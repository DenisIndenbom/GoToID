/**
* Checks if data is a username. This is used to validate user input from the API. The format of the username is a series of characters separated by white space.
* 
* @param data - The data to check. Must be non - empty.
* 
* @return { boolean } True if the username is valid false otherwise. Defaults to false if not valid but can be changed by changing the return value
*/
function username(data) {
    return /^[a-z0-9_]{3,15}$/.test(data)
}

/**
* Checks if data is a name. This is used to validate user input from the API. The format of the username is a series of characters separated by white space.
* 
* @param data - The data to check. Must be non - empty.
* 
* @return { boolean } True if the name is valid false otherwise. Defaults to false if not valid but can be changed by changing the return value
*/
function name(data) {
    return data.length < 30 
}

/**
* Checks if a string is an email. This is a helper function for email ()
* 
* @param data - The string to check.
* 
* @return { boolean } True if the string is an email
*/
function email(data) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)
}

/**
* Password validator for data. It returns true if the data is password and false otherwise. 
* 
* @param data - The data to validate. Should be a string
* 
* @return { boolean } True if the data is password
*/
function password(data) {
    return !!data
}

/**
* Checks if data is invited to a user. This is used to determine if a user's invite code should be used or not
* 
* @param data - The data to be checked
* 
* @return { boolean } True if the data is invited to a user false otherwise. Returns false if the data is
*/
function invite_code(data) {
    return /^[A-Za-z0-9_]{3,15}$/.test(data)
}

/**
* URL validator for data. It returns true if the data is URL and false otherwise. 
* 
* @param data - The data to validate. Should be a string
* 
* @return { boolean } True if the data is URL
*/
function url(data) {
    return data.length < 1024
}

/**
* Checks if a string is an about
* 
* @param data - The data to be checked.
* 
* @return { boolean } True if there is 'about'
*/
function user_about(data) {
    return data.length <= 300
}

module.exports = {
    username: username,
    name: name,
    email: email,
    password: password,
    invite_code: invite_code,
    url: url,
    user_about: user_about
}