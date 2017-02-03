"use strict";

angular.module("viciauth", []).run(function () {
	console.info("[ViciAuth] Launching Auth Module..");
}).value("API_URL", "https://api.studentask.de").value("API", {
	API_URL: "https://api.studentask.de",
	LOGIN: "/login",
	SIGNUP: "/signup",
	VALIDATE: "/validate",
	FACEBOOK: "/networks/facebook",
	LOGOUT: "/logout"
}).factory("apiFactory", function (API) {
	return function (method) {
		return API.API_URL + API[method];
	};
}).service("ViciAuth", function ($window, $http, $q, API, apiFactory) {
	var LOCAL_TOKEN_KEY = 'ST_AUTH_TOKEN';
	var LOCAL_USER_ID_KEY = 'ST_AUTH_USERID';

	var username = '';
	var isAuthenticated = false;
	var role = '';
	var authToken = void 0;
	var authUserId = void 0;

	function configure(configKey, configValue) {
		API[configKey] = configValue;
	}

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

	function login(email, password) {
		return $q(function (resolve, reject) {
			return $http.post(apiFactory("LOGIN"), {
				id: email,
				pw: password
			}).success(function (data) {
				storeUserCredentials(data.token, data.userId);

				return resolve(data);
			}).error(function (data) {
				return reject(data);
			});
		});
	}

	function signup(email, password, params) {
		return $q(function (resolve, reject) {
			var body = {
				params: params,
				password: password,
				email: email
			};

			$http.post(apiFactory("SIGNUP"), body).success(function (data) {
				storeUserCredentials(data.token, data.userId);
				resolve(data);
			}).error(function (data) {
				return reject(data);
			});
		});
	}

	function validate(callback) {
		$http.post(apiFactory("VALIDATE"), {
			token: $window.localStorage.getItem(LOCAL_TOKEN_KEY)
		}).then(function (response) {
			return callback(response.data);
		});
	}

	function logout() {
		$http.post(apiFactory("LOGOUT")).then(function (data) {
			return destroyUserCredentials();
		});
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
}).run(function (ViciAuth) {
	return ViciAuth.loadUserCredentials();
});