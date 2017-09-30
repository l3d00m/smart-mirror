function Spotify($scope, SpotifyService, SpeechService, $interval, Focus) {

	var isPlaying = [];
	var refreshKeys = config.spotify.refreshKeys;

	var updateSpotifyInfo = function () {
		refreshKeys.forEach(function(key) {
			SpotifyService.getPlaying(key).then(function (item) {
				if(item.device.name == 'Küche' && item.device.is_active && item.is_playing) {
					$scope.spotifyTitle = item.item.name;
					$scope.spotifyArtist = item.item.artists[0].name;
					$scope.albumCover = item.item.album.images[1].url;
					isPlaying[refreshKeys.indexOf(key)] = true;
				}
				else {
					isPlaying[refreshKeys.indexOf(key)] = false;
				}
			}, function (error) {
				$scope.spotify = {error: error};
			});
		});

		if(isPlaying.indexOf(true) == -1) {
			$scope.showSpotify = false;
		}
		else {
			$scope.showSpotify = true;
		}
	};



	if(typeof config.spotify.refreshKeys != 'undefined' && refreshKeys.length){
		$interval(updateSpotifyInfo, 2000);
	}

}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);
