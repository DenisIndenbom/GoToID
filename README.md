# GoToID - OAuth Server for GoToCamp Community

## Overview
GoToID is an authorization server designed specifically for the GoToCamp community. It provides OAuth capabilities to allow secure and seamless authentication and authorization for GoToCamp users.

## Setup authorization for your app
GoToID supports the standard OAuth 2.0 API <br>
You can create an application on the [GoToID website]() <br>
Code example: [test-goto-app](https://github.com/DenisIndenbom/gotoid-client-example)

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
GET /api/userinfo
```
**Returned parameters**
```json
{
    "user_id": 1,
    "username": "name", 
    "createdAt": "2023-12-02 00:00:00"
}
```

## License
GoToID is licensed under the [MIT License](LICENSE).