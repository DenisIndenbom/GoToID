# GoToID - OAuth Server for GoToCamp Community

## Overview
GoToID is an authorization server designed specifically for the GoToCamp community. It provides OAuth capabilities to allow secure and seamless authentication and authorization for GoToCamp users.

## Setup authorization for your app
GoToID supports the standard OAuth 2.0 API <br>
You can create an application on the [GoToID website]() <br>
Code example: [gotoid-client-example](https://github.com/DenisIndenbom/gotoid-client-example)

## OAuth 2.0 API
### Authorization URI
```
Authorization URI: /oauth?response_type=code&client_id=<client id>&redirect_uri=<redirect uri>
```

### Possible _scopes_
- `user`
- `email`
- `telegram`
- `avatar`

### Access Token
```js
POST /oauth/token
```
**Input parameters**
```json
{
    "headers": 
    {
        "Content-Type": "applicatio-x-www-form-urlencoded"
    },
    "body": "code=<code>&client_secret=<secret>&client_id=<id>&grant_type=authorization_code",

}
```
**Returned parameters**
```json
{
    "access_token": "<access token>",
    "token_type": "<token type>",
    "refresh_token": "<refresh token>"
}
```
### Refresh Token
```js
POST /oauth/token
```
**Input parameters**
```json
{
    "headers": 
    {
        "Content-Type": "applicatio-x-www-form-urlencoded"
    },
    "body": "refresh_token=<refreshToken>&client_secret=<secret>&client_id=<id>&grant_type=refresh_token",
}
```
**Returned parameters**
```json
{
    "access_token": "<access token>",
    "token_type": "<token type>",
    "refresh_token": "<refresh token>"
}
```

## API
**Important:** access token must store in header of request.
```
Authorization: Bearer <token>
```

### **API Access**
```js
GET /api/
```
**Returned parameters**
```json
{
    "success": true
}

```
### **User Info**
```js
GET /api/user
```

**Scope**: `user`

**Returned parameters**
```json
{
    "user_id": 1,
    "username": "name",
    "first_name": "first name",
    "last_name": "last name",
    "type": "student", 
    "createdAt": "2023-12-02 00:00:00"
}
```

### **User email**
```js
GET /api/email
```

**Scope**: `email`

**Returned parameters**
```json
{
    "email": "mail@example.com"
}
```

### **User telegram**
```js
GET /api/telegram
```

**Scope**: `telegram`

**Returned parameters**
```json
{
    "telegram": "telegram_user"
}
```

### **User avatar**
```js
GET /api/avatar
```

**Scope**: `avatar`

**Returned parameters**
```json
{
    "avatar": "https://example.com/photo-150x150"
}
```

## License
GoToID is licensed under the [MIT License](LICENSE).