(function () {
	'use strict';
	function SpotifyService($http, $httpParamSerializer, $q) {
		var service = {};

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
				});
			});
			return deferred.promise;
		}

		service.getAccessToken = function (key) {
			var deferred = $q.defer();
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
				deferred.resolve(response.data.access_token);
			});
			return deferred.promise;
		}
		return service;
	}

	angular.module('SmartMirror')
        .factory('SpotifyService', SpotifyService);
}());
