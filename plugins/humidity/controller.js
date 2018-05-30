/**
 * Created by nicoo on 14.10.2017.
 */
function Humidity($scope, $timeout, ClimateService) {

	var updateInfoIntervall = function() {

		ClimateService.getTemperature()
			.then(data => {
				$scope.temperatureValue = data.state;
			});

		ClimateService.getHumidity()
			.then(data => {
				$scope.humidityValue = data.state;
			});

		$timeout(updateInfoIntervall, 5000);
	}

	if (typeof config.climate !== 'undefined') {
		updateInfoIntervall();
	}

}

angular.module('SmartMirror')
	.controller('Humidity', Humidity);