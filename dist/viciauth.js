"use strict";

angular.module("viciauth", []).value("API", {
	API_URL: "https://api.studentask.de",
	ME: "/me",
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
	var _isAuthenticated = false;
	var role = '';
	var authToken = void 0;
	var authUserId = void 0;

	var configure = function configure(configKey, configValue) {
		return API[configKey] = configValue;
	};

	var useCredentials = function useCredentials(token, userId) {
		_isAuthenticated = true;
		authToken = token;
		authUserId = userId;

		$http.defaults.headers.common['X-Auth-Token'] = token;
	};

	var storeUserCredentials = function storeUserCredentials(token, userId) {
		$window.localStorage.setItem(LOCAL_USER_ID_KEY, userId);
		$window.localStorage.setItem(LOCAL_TOKEN_KEY, token);

		useCredentials(token, userId);
	};

	var loadUserCredentials = function loadUserCredentials() {
		var token = $window.localStorage.getItem(LOCAL_TOKEN_KEY);
		var userId = $window.localStorage.getItem(LOCAL_USER_ID_KEY);

		if (token) {
			useCredentials(token, userId);
		}
	};

	var destroyUserCredentials = function destroyUserCredentials() {
		authToken = undefined;
		authUserId = undefined;
		_isAuthenticated = false;

		$http.defaults.headers.common['X-Auth-Token'] = undefined;

		$window.localStorage.removeItem(LOCAL_TOKEN_KEY);
		$window.localStorage.removeItem(LOCAL_USER_ID_KEY);
	};

	var loginSignupFnFactory = function loginSignupFnFactory(loginOrSignup) {
		return function (postData) {
			return $q(function (resolve, reject) {
				return $http.post(apiFactory(loginOrSignup), postData).success(function (data) {
					storeUserCredentials(data.token, data.userId);

					return resolve(data);
				}).error(function (data) {
					return reject(data);
				});
			});
		};
	};

	var login = loginSignupFnFactory('LOGIN');

	var signup = loginSignupFnFactory('SIGNUP');

	var validate = function validate(callback) {
		return $http.post(apiFactory("VALIDATE"), {
			token: $window.localStorage.getItem(LOCAL_TOKEN_KEY)
		}).then(function (response) {
			return callback(response.data);
		});
	};

	var logout = function logout() {
		return $http.post(apiFactory("LOGOUT")).then(function (data) {
			return destroyUserCredentials();
		});
	};

	var me = function me(callback, errFn) {
		return $http.get(apiFactory("ME")).then(function (response) {
			return callback(response.data);
		}, function (response) {
			return errFn(response);
		});
	};

	return {
		me: me, configure: configure, validate: validate, login: login, signup: signup, logout: logout, loadUserCredentials: loadUserCredentials,
		getUserId: function getUserId() {
			return authUserId;
		},
		getToken: function getToken() {
			return authToken;
		},
		isAuthenticated: function isAuthenticated() {
			return _isAuthenticated;
		}
	};
}).run(function (ViciAuth) {
	return ViciAuth.loadUserCredentials();
});