function Spotify($scope, SpotifyService, SpeechService, $timeout) {

	var refreshKeys;
	var updateProgressTimeout;
	var sessionToken = -1;
	let accessTokens = [];
	let rateLimitEpoch = 0;

	// Pause playback
	SpeechService.addCommand('spotify_pause', function () {
		console.debug("Pause spotify playback");
		SpotifyService.pausePlayback(sessionToken);
	});

	// Play next track
	SpeechService.addCommand('spotify_next_track', function () {
		console.debug("Spotify play next track");
		SpotifyService.playNext(sessionToken);
	});

	// Play previous track
	SpeechService.addCommand('spotify_previous_track', function () {
		console.debug("Spotify play previous track");
		SpotifyService.playPrevious(sessionToken);
	});

	var refreshApiKeys = function (refreshKey) {
		// noinspection JSUnresolvedFunction
		return SpotifyService.getAccessToken(refreshKey)
			.then(function (data) {
				accessTokens[refreshKey].accessToken = data['access_token'];
				accessTokens[refreshKey].tokenExpirationEpoch = (new Date().getTime() / 1000) + data['expires_in'];
				console.log('Refreshed token. It now expires in ' + Math.floor(accessTokens[refreshKey].tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!');
			}, function (err) {
				console.log('Could not refresh the token!', err.message);
			});
	}

	var updateSpotifyInterval = function () {

		if ((rateLimitEpoch - new Date().getTime() / 1000) > 0) {
			$scope.showSpotify = false;
			console.log("Rate limited, waiting for " + (rateLimitEpoch - new Date().getTime() / 1000) + " seconds");
			return;
		}

		var actions = refreshKeys.map((key) => {

			if ( accessTokens[key].accessToken === undefined || (accessTokens[key].tokenExpirationEpoch - new Date().getTime() / 1000) < 60) {
				return refreshApiKeys(key).then( () => {
					return SpotifyService.getPlaying(accessTokens[key].accessToken);
				});
			}else {
				return SpotifyService.getPlaying(accessTokens[key].accessToken);
			}
		});

		var results = Promise.all(actions);

		results.then(data => {
			let currentPlaying;
			data.forEach(function (singleData) {
				if(singleData.data['is_playing'] !== undefined && config.spotify.Rooms.indexOf(singleData.data['device'].name) !== -1) {
					currentPlaying = singleData;
				}
			});

			if (currentPlaying !== undefined) {
				updatePlayerView(currentPlaying);
			}
			else {
				$scope.showSpotify = false;
				console.log("Playback is stopped");
			}

		})
			.catch(err => {
				$scope.showSpotify = false;
				console.log(err);
			});

		$timeout(updateSpotifyInterval, 5000);
	};


	var updatePlayerView = function (item) {
		// Cancel current progress bar runner
		$timeout.cancel(updateProgressTimeout);

		if (item.status === 429) {
			// Rate limited
			rateLimitEpoch = (new Date().getTime() / 1000) + item.headers["Retry-After"] + 5;
		}
		// Generify the needed response items
		var title = item.data.item.name;
		var artist = item.data.item.artists[0].name;
		var cover_url = item.data.item.album.images[1].url;
		var progress = item.data.progress_ms;
		var duration = item.data.item.duration_ms;

		// Add title, artist and cover
		$scope.spotifyTitle = title;
		$scope.spotifyArtist = artist;
		$scope.albumCover = cover_url;

		// Add the progress bar
		$scope.spotifyProgressBar = Math.round(progress / duration * 1000);
		$scope.spotifyCurrentProgress = formatDuration(progress);
		$scope.spotifyDuration = formatDuration(duration);

		// Make the player view visible
		$scope.showSpotify = true;

		// Auto update the progress bar every _full_ second (means no milliseconds left),
		// as we only poll the spotify API every few seconds and that would make the bar 'jumpy'
		var timeToReachNextFullSecond = 1000 - (progress % 1000);
		updateProgressTimeout = $timeout(function () {
			updateProgress(progress + timeToReachNextFullSecond, duration);
		}, timeToReachNextFullSecond);
	};

	var formatDuration = function (duration) {
		// Use a workaround for moment.js to format milliseconds to mm:ss
		var moment_item = moment("1900-01-01 00:00:00").add(duration, 'milliseconds');
		return moment_item.format("mm:ss");
	};

	var updateProgress = function (progress, duration) {
		// Don't run if the progress time is greater than the full duration of the track
		if (progress > duration) {
			return;
		}
		// Cancel runner just to be sure
		$timeout.cancel(updateProgressTimeout);
		// Update the progress at the next full second, i.e. in 1000 milliseconds because we are currently at a full second
		updateProgressTimeout = $timeout(function () {
			updateProgress(progress + 1000, duration);
		}, 1000);

		// Update the progress bar
		$scope.spotifyProgressBar = Math.round(progress / duration * 1000);
		$scope.spotifyCurrentProgress = formatDuration(progress);
	};

	// Start the loading if config is set
	if (typeof config.spotify !== 'undefined') {
		refreshKeys = config.spotify.refreshKeys;

		refreshKeys.forEach(function(key){
			accessTokens[key] = {};
		});

		updateSpotifyInterval();
	}

}

angular.module('SmartMirror')
	.controller('Spotify', Spotify);
