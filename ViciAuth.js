angular.module("ViciAuth",[])
.run(function(){
	console.info("[ViciAuth] Launching Auth Module..");
})
.constant("API_URL","http://vicigo.com")
.constant("API",{
	LOGIN : "/viciauth/login",
	SIGNUP : "/viciauth/signup",
	VALIDATE : "/viciauth/validate",
	FACEBOOK : "/viciauth/networks/facebook",
	LOGOUT : "/viciauth/logout"
})
.factory("apiFactory",function(API_URL,API){
	return function(method){
		return API_URL + API[method];
	};
})
.service("ViciAuth", function($window,$http,$q,apiFactory) {

  var LOCAL_TOKEN_KEY = 'vicigoAuthToken';
	var LOCAL_USER_ID_KEY = 'vicigoUserId';
	var username = '';
	var isAuthenticated = false;
	var role = '';
	var authToken;
	var authUserId;

	
	function useCredentials(token, userId) {
		console.info("[ViciAuth] Using User Credentials..");
		isAuthenticated = true;
		authToken = token;
		authUserId = userId;
		$http.defaults.headers.common['X-Auth-Token'] = token;
	}
	
	function loadUserCredentials() {
		console.info("[ViciAuth] Loading User Credentials..");
		var token = $window.localStorage.getItem(LOCAL_TOKEN_KEY);
		var userId = $window.localStorage.getItem(LOCAL_USER_ID_KEY);
		console.log(userId,token);
		if (token) {
			useCredentials(token, userId);
		}
	}

	function storeUserCredentials(token, userId) {
		console.info("[ViciAuth] Storing User Credentials..");
		$window.localStorage.setItem(LOCAL_USER_ID_KEY, userId);
		$window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token, userId);
	}



	function destroyUserCredentials() {
		console.info("[ViciAuth] Destroying User Credentials..");
		authToken = undefined;
		authUserId = undefined;
		isAuthenticated = false;
		$http.defaults.headers.common['X-Auth-Token'] = undefined;
		$window.localStorage.removeItem(LOCAL_TOKEN_KEY);
		$window.localStorage.removeItem(LOCAL_USER_ID_KEY);
	}

  function login(id, pw) {
		console.info("[ViciAuth] Loggin in..");
		return $q(function(resolve, reject) {
			var body = {
				id: id,
				pw: pw,
			};
			$http.post(apiFactory("LOGIN"), body)
				.success(function(data) {
					console.log(data);
					storeUserCredentials(data.token, data.userId);
					resolve(data);
				})
				.error(function(data) {
					console.error(data);
					reject(data);
				});
		});
	}

	function signup(data) {
		console.info("[ViciAuth] Signing Up..");
		return $q(function(resolve, reject) {
			var body = {
				username: data.username,
				password: data.password,
        email : data.email
			};
			$http.post(apiFactory("SIGNUP"), body)
				.success(function(data) {
					console.log(data);
					storeUserCredentials(data.token, data.userId);
					resolve(data);
				})
				.error(function(data) {
					console.error(data);
					reject(data);
				});
		});
	}

	function validate(callback) {
		console.info("[ViciAuth] Checking token ..");
		$http.post(apiFactory("VALIDATE"),{token:$window.localStorage.getItem(LOCAL_TOKEN_KEY)}).then(function(response) {
			console.log(response);
			callback(response.data);
		});
	}

	function logout() {
		console.info("[ViciAuth] Bye Bye..");
    $http.post(apiFactory("LOGOUT")).then(function(data) {
      destroyUserCredentials();
		});
	} 
 
			return {
        authUserId : authUserId,
        validate : validate,
				login: login,
        signup : signup,
        logout : logout,
        isAuthenticated : isAuthenticated,
				loadUserCredentials : loadUserCredentials
			};

	})
.run(function(ViciAuth){
	ViciAuth.loadUserCredentials();
});