/**
 * Created by nicoo on 14.10.2017.
 */
function Humidity($scope, $timeout) {

	var sensor = require('node-dht-sensor');

	var updateInfoIntervall = function() {
		sensor.read(22, 4, function(err, temperature, humidity) {
			if(!err) {
				console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
					'humidity: ' + humidity.toFixed(1) + '%'
				);
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