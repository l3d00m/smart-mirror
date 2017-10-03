(function () {
	'use strict';

	function SpotifyService($http, $httpParamSerializer, $q) {
		var service = {};
		var token = -1;

		service.getAccessToken = function (key) {
			var deferred = $q.defer();
			if (token !== -1) {
				deferred.resolve(token);
			} else {
				var req = {
					method: 'POST',
					url: 'https://accounts.spotify.com/api/token',
					headers: {
						'Authorization': 'Basic ' + config.spotify.appSecret,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: $httpParamSerializer({'grant_type': "refresh_token", 'refresh_token': key})
				};
				$http(req).then(function (response) {
					token = response.data.access_token;
					deferred.resolve(token);
				});
			}

			return deferred.promise;
		};

		var handleSpotifyApiError = function (error) {
			if (error.status === 401) {
				// Unauthorized, means the token is invalid
				token = -1;
				console.debug("Token invalid, renewing" + error);
			} else if (error.status === 502 || error.status === 503) {
				console.debug(error);
			} else {
				console.log(error);
			}
		};

		service.getPlaying = function (key) {
			var deferred = $q.defer();
			service.getAccessToken(key).then(function (token) {
				var req = {
					method: 'GET',
					url: 'https://api.spotify.com/v1/me/player',
					headers: {
						'Authorization': 'Bearer ' + token
					}
				};
				$http(req).then(function (response) {
					deferred.resolve(response.data);
				}, function (error) {
					handleSpotifyApiError(error);
				});
			});
			return deferred.promise;
		};

		service.playNext = function (key) {
			service.getAccessToken(key).then(function (token) {
				var req = {
					method: 'POST',
					url: 'https://api.spotify.com/v1/me/player/next',
					headers: {
						'Authorization': 'Bearer ' + token
					}
				};
				$http(req).then(function () {
				}, function (error) {
					handleSpotifyApiError(error);
				});
			});
		};

		service.playPrevious = function (key) {
			service.getAccessToken(key).then(function (token) {
				var req = {
					method: 'POST',
					url: 'https://api.spotify.com/v1/me/player/previous',
					headers: {
						'Authorization': 'Bearer ' + token
					}
				};
				$http(req).then(function () {
				}, function (error) {
					handleSpotifyApiError(error);
				});
			});
		};

		service.pausePlayback = function (key) {
			service.getAccessToken(key).then(function (token) {
				var req = {
					method: 'PUT',
					url: 'https://api.spotify.com/v1/me/player/pause',
					headers: {
						'Authorization': 'Bearer ' + token
					}
				};
				$http(req).then(function () {
				}, function (error) {
					handleSpotifyApiError(error);
				});
			});
		};

		return service;
	}

	angular.module('SmartMirror')
		.factory('SpotifyService', SpotifyService);
}());
