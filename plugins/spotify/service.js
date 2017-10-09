(function () {
	'use strict';

	function SpotifyService($http, $httpParamSerializer, $q) {
		var service = {};

		service.getAccessToken = function (refreshKey) {
			var deferred = $q.defer();
			var req = {
				method: 'POST',
				url: 'https://accounts.spotify.com/api/token',
				headers: {
					'Authorization': 'Basic ' + config.spotify.appSecret,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer({'grant_type': "refresh_token", 'refresh_token': refreshKey})
			};
			$http(req).then(function (response) {
				deferred.resolve(response.data.access_token);
			});

			return deferred.promise;
		};

		var handleSpotifyApiError = function (error) {
			if (error.status === 401) {
				// Unauthorized, means the token is invalid
				console.debug("Token invalid, renewing" + error);
			} else if (error.status === 502 || error.status === 503) {
				console.debug(error);
			} else {
				console.log(error);
			}
		};

		service.getPlaying = function (token) {
			var deferred = $q.defer();
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
				deferred.reject(error);
			});

			return deferred.promise;
		};

		service.playNext = function (token) {
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
		};

		service.playPrevious = function (token) {
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
		};

		service.pausePlayback = function (token) {
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
		};

		return service;
	}

	angular.module('SmartMirror')
		.factory('SpotifyService', SpotifyService);
}());
