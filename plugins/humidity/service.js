(function() {
	function ClimateService($http,$httpParamSerializer, $q)
	{
		var service = {};

		service.getTemperature = function () {
			var deferred = $q.defer();
			var req = {
				method: 'GET',
				url: config.climate.temperatureUri
			};
			$http(req).then(function (response) {
				deferred.resolve(response.data);
			}, function (error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

		service.getHumidity = function () {
			var deferred = $q.defer();
			var req = {
				method: 'GET',
				url: config.climate.humidityUri
			};
			$http(req).then(function (response) {
				deferred.resolve(response.data);
			}, function (error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}
		return service;
	}

	angular.module('SmartMirror')
		.factory('ClimateService', ClimateService);

}());