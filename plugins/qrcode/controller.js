function QRcode($scope, SpeechService, Focus) {

	function showRemoteQR() {
		const interfaces = require('os').networkInterfaces()
		let addresses = []
		for (let k in interfaces) {
			for (let k2 in interfaces[k]) {
				let address = interfaces[k][k2]
				if (address.family === 'IPv4' && !address.internal) {
					addresses.push(address.address)
				}
			}
		}
		$scope.remoteText = addresses[0] + ":" + config.remote.port;
		$scope.remoteImage = "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=http://" + $scope.remoteText;
		Focus.change("remote");
	}

	if (config.remote && config.remote.enabled) {
		SpeechService.addCommand('show_remoteQR', function () {
			showRemoteQR()
		});
	}

	// First Run
	if (config.remote.firstRun) {
		$scope.firstRun = true;
		showRemoteQR()
	}

	function showWifiQR() {
		$scope.remoteText = "SSID: " + config.qrcode.ssid + " |  Passwort: " + config.qrcode.password;
		$scope.remoteImage = "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=" +
			// https://github.com/zxing/zxing/wiki/Barcode-Contents#wifi-network-config-android
			encodeURIComponent("WIFI:T:" + config.qrcode.method + ";S:" + config.qrcode.ssid + ";P:" + config.qrcode.password + ";;");
		Focus.change("remote");
	}

	if (config.qrcode) {
		SpeechService.addCommand('show_wifiQR', function () {
			showWifiQR()
		});
	}
}

angular.module('SmartMirror')
	.controller('QRcode', QRcode);
