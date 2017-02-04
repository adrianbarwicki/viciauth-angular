# viciauth-angular


## Configuration
The module can be customized during the build and/or run-time. 

### Customized build
In order to get the customized build, edit the file under config/config.json und run the default gulp task. The build version will be available unser '/dist/viciauth.js'.

### Run-time Configuration
```
ViciAuth.configure("configKey", 'ConfigValue');
```

You can configure the following properties:
```
"API_URL": "https://yourapiurl.com",
"API_PATHS.LOGIN": "/login",
"API_PATHS.SIGNUP": "/signup",
"API_PATHS.VALIDATE": "/validate",
"API_PATHS.FACEBOOK": "/networks/facebook",
"API_PATHS.LOGOUT": "/logout",
"LOCAL_STORAGE.TOKEN_KEY": "ST_AUTH_TOKEN",
"LOCAL_STORAGE.USERID_KEY": "ST_AUTH_USERID",
"HEADERS.TOKEN": "X-Auth-Token"
```

### API

#### login(postData)
#### signup(postData)
#### validate(postData)
#### getUserId()
#### getToken()
#### isAuthenticated()

### Authors
Adrian Barwicki
viciqloud.com[http://viciqloud.com]

### Licence
MIT