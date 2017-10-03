function Spotify($scope, SpotifyService, SpeechService, $timeout) {

	var currentPlaying = -1;
	var refreshKeys = config.spotify.refreshKeys;
	var updateProgressTimeout;

	// Pause playback
	SpeechService.addCommand('spotify_pause', function () {
		console.debug("Pause spotify playback");
		SpotifyService.pausePlayback(refreshKeys[currentPlaying]);
	});

	// Play next track
	SpeechService.addCommand('spotify_next_track', function () {
		console.debug("Spotify play next track");
		SpotifyService.playNext(refreshKeys[currentPlaying]);
	});

	// Play previous track
	SpeechService.addCommand('spotify_previous_track', function () {
		console.debug("Spotify play previous track");
		SpotifyService.playPrevious(refreshKeys[currentPlaying]);
	});

	var updateSpotifyInterval = function () {
		if (currentPlaying >= 0) {
			// We already know which account is currently streaming
			// So fetch this account
			processSingleSpotifyAccount(refreshKeys[currentPlaying]);
			// Fetch the API more often to make faster updates if the playing state changes
			$timeout(updateSpotifyInterval, 1500);
		} else {
			// Either there's no account streaming or we don't know which one,
			// so iterate through all accounts
			refreshKeys.forEach(function (key) {
				processSingleSpotifyAccount(key);
			});
			// Request the API less often to save bandwidth and avoid rate limiting
			$timeout(updateSpotifyInterval, 5000);
		}
	};

	var processSingleSpotifyAccount = function (key) {
		SpotifyService.getPlaying(key).then(function (item) {
			if (item.device.name === 'Küche' && item.device.is_active && item.is_playing) {
				// Update isPlaying state
				currentPlaying = refreshKeys.indexOf(key);
				updatePlayerView(item);
			} else if (currentPlaying === refreshKeys.indexOf(key)) {
				// The playback on this account has now stopped
				$scope.showSpotify = false;
				currentPlaying = -1;
			} else {
				// This account is currently not streaming to the device
			}
		}, function (error) {
			$scope.spotify = {error: error};
		});
	};

	var updatePlayerView = function (item) {
		// Cancel current progress bar runner
		$timeout.cancel(updateProgressTimeout);

		// Generify the needed response items
		var title = item.item.name;
		var artist = item.item.artists[0].name;
		var cover_url = item.item.album.images[1].url;
		var progress = item.progress_ms;
		var duration = item.item.duration_ms;

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
	if (typeof config.spotify.refreshKeys !== 'undefined' && refreshKeys.length) {
		updateSpotifyInterval();
	}

}

angular.module('SmartMirror')
	.controller('Spotify', Spotify);
