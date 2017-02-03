"use strict";

angular.module("viciauth", []).run(function () {
	console.info("[ViciAuth] Launching Auth Module..");
}).constant("API_URL", "https://viciqloud.com").constant("API", {
	LOGIN: "/login",
	SIGNUP: "/signup",
	VALIDATE: "/validate",
	FACEBOOK: "/networks/facebook",
	LOGOUT: "/logout"
}).factory("apiFactory", function (API_URL, API) {
	return function (method) {
		return API_URL + API[method];
	};
}).service("ViciAuth", function ($window, $http, $q, apiFactory) {
	var LOCAL_TOKEN_KEY = 'ST_AUTH_TOKEN';
	var LOCAL_USER_ID_KEY = 'ST_AUTH_USERID';

	var username = '';
	var isAuthenticated = false;
	var role = '';
	var authToken = void 0;
	var authUserId = void 0;

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

	function login(id, pw) {
		return $q(function (resolve, reject) {
			var body = {
				id: id,
				pw: pw
			};

			$http.post(apiFactory("LOGIN"), body).success(function (data) {
				storeUserCredentials(data.token, data.userId);

				return resolve(data);
			}).error(function (data) {
				return reject(data);
			});
		});
	}

	function signup(data) {
		return $q(function (resolve, reject) {
			var body = {
				username: data.username,
				password: data.password,
				email: data.email
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