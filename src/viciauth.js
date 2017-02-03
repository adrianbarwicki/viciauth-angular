angular.module("viciauth",[])
.run(() => {
	console.info("[ViciAuth] Launching Auth Module..");
})
.value("API_URL", "@@API_URL")
.value("API", {
	API_URL: "@@API_URL",
	LOGIN: "@@API_PATHS.LOGIN",
	SIGNUP: "@@API_PATHS.SIGNUP",
	VALIDATE: "@@API_PATHS.VALIDATE",
	FACEBOOK: "@@API_PATHS.FACEBOOK",
	LOGOUT: "@@API_PATHS.LOGOUT"
})
.factory("apiFactory", (API) => method => API.API_URL + API[method])

.service("ViciAuth", ($window, $http, $q, API, apiFactory) => {
  	const LOCAL_TOKEN_KEY = '@@LOCAL_STORAGE.TOKEN_KEY';
	const LOCAL_USER_ID_KEY = '@@LOCAL_STORAGE.USERID_KEY';

	let username = '';
	let isAuthenticated = false;
	let role = '';
	let authToken;
	let authUserId;

	function configure (configKey, configValue) {
		API[configKey] = configValue;
	}

	function useCredentials (token, userId) {
		console.info("[ViciAuth] Using User Credentials..");

		isAuthenticated = true;
		authToken = token;
		authUserId = userId;

		$http.defaults.headers.common['@@HEADERS.TOKEN'] = token;
	}
	
	function loadUserCredentials () {
		console.info("[ViciAuth] Loading User Credentials..");

		var token = $window.localStorage.getItem(LOCAL_TOKEN_KEY);
		var userId = $window.localStorage.getItem(LOCAL_USER_ID_KEY);

		if (token) {
			useCredentials(token, userId);
		}
	}

	function storeUserCredentials(token, userId) {
		$window.localStorage.setItem(LOCAL_USER_ID_KEY, userId);
		$window.localStorage.setItem(LOCAL_TOKEN_KEY, token);

		useCredentials(token, userId);
	}



	function destroyUserCredentials() {

		authToken = undefined;
		authUserId = undefined;
		isAuthenticated = false;

		$http.defaults.headers.common['X-Auth-Token'] = undefined;
		
		$window.localStorage.removeItem(LOCAL_TOKEN_KEY);
		$window.localStorage.removeItem(LOCAL_USER_ID_KEY);
	}

  function login (email, password) {
		return $q((resolve, reject) =>
			$http.post(apiFactory("LOGIN"), {
				id: email,
				pw: password,
			})
			.success(data => {
				storeUserCredentials(data.token, data.userId);
				
				return resolve(data);
			})
			.error(data => reject(data)));
	}

	function signup (email, password, params) {
		return $q((resolve, reject) => {
			const body = {
				params: params,
				password: password,
        		email: email
			};

			$http.post(apiFactory("SIGNUP"), body)
				.success(data => {
					storeUserCredentials(data.token, data.userId);
					resolve(data);
				})
				.error(data => reject(data));
		});
	}

	function validate (callback) {
		$http.post(apiFactory("VALIDATE"), {
			token: $window.localStorage.getItem(LOCAL_TOKEN_KEY)
		}).then(response => callback(response.data));
	}

	function logout() {
    	$http.post(apiFactory("LOGOUT")).then(data => destroyUserCredentials());
	} 
 
	return {
		configure: configure,
		authUserId: authUserId,
		validate: validate,
		login: login,
		signup: signup,
		logout: logout,
		isAuthenticated: isAuthenticated,
		loadUserCredentials: loadUserCredentials
	};
})

.run(ViciAuth => ViciAuth.loadUserCredentials());