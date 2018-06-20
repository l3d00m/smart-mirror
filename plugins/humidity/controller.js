/**
 * Created by nicoo on 14.10.2017.
 */
function Humidity($scope) {

	var mqtt = require('mqtt');

	if (typeof config.climate !== 'undefined') {
		var client = mqtt.connect(config.climate.uri);
		client.on('connect', function () {
			client.subscribe(config.climate.temperature_topic);
			client.subscribe(config.climate.humidity_topic);
		});

		client.on('message', function (topic, message) {
			message = JSON.parse(message);
			if (topic === config.climate.temperature_topic){
				$scope.temperatureValue = message;
			}
			if (topic === config.climate.humidity_topic){
				$scope.humidityValue = message;
			}


		});
	} else {
		console.log("Climate config not set")
	}

}

angular.module('SmartMirror')
	.controller('Humidity', Humidity);