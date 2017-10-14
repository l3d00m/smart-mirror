/**
 * Created by nicoo on 14.10.2017.
 */
function Humidity($scope, $timeout) {

	var sensor = require('node-dht-sensor');

	var updateInfoIntervall = function() {
		sensor.read(config.humidity.sensorType, config.humidity.pin, function(err, temperature, humidity) {
			if(!err) {
				$scope.temperatureValue = temperature.toFixed(1);
				$scope.humidityValue = humidity.toFixed(1);
			}
		});
		$timeout(updateInfoIntervall, 5000);
	}

	if (typeof config.humidity !== 'undefined' && typeof config.humidity.pin === 'number') {
		updateInfoIntervall();
	}

}

angular.module('SmartMirror')
	.controller('Humidity', Humidity);