/**
 * Created by nicoo on 14.10.2017.
 */
function Humidity($scope) {

	var mqtt = require('mqtt');

	if (typeof config.climate !== 'undefined') {
		var client = mqtt.connect(config.climate.uri);
		client.on('connect', function () {
			client.subscribe(config.climate.topic);
		})

		client.on('message', function (topic, message) {
			message = JSON.parse(message);
			$scope.temperatureValue = message.temperatur;
			$scope.humidityValue = message.humidity;
		});
	}

}

angular.module('SmartMirror')
	.controller('Humidity', Humidity);