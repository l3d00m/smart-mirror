function Spotify($scope, SpotifyService, SpeechService, $timeout) {

	var refreshKeys;
	var updateProgressTimeout;
	var sessionToken = -1;
	var tokenExpireDate = -1;

	//TODO: set Time based on response and delete this const
	const expireIn = 3600;

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

	var updateSpotifyInterval = function () {
		if (sessionToken != -1 && (tokenExpireDate - new Date()) >= 0) {
			// We already know which account is currently streaming
			// So fetch this account
			processSingleSpotifyAccount(sessionToken);
			// Fetch the API more often to make faster updates if the playing state changes
			$timeout(updateSpotifyInterval, 1500);
		} else {
			// In cases that there's no account streaming, we don't know which or the Token is expired
			// so iterate through all account and refresh the Access Tokens
			refreshKeys.forEach(function (key) {
				SpotifyService.getAccessToken(key).then(function (token) {
					processSingleSpotifyAccount(token);
				});
			});
			// Request the API less often to save bandwidth and avoid rate limiting
			$timeout(updateSpotifyInterval, 5000);
		}
	};

	var processSingleSpotifyAccount = function (token) {
		SpotifyService.getPlaying(token).then(function (item) {
			if (item.device.name === 'Küche' && item.device.is_active && item.is_playing) {
				// Update sessionToken
				if(sessionToken != token)
				{
					//session changed
					sessionToken = token;
					tokenExpireDate = new Date();
					tokenExpireDate.setSeconds( tokenExpireDate.getSeconds() + expireIn*0.9);
				}
				updatePlayerView(item);
			} else if (sessionToken === token) {
				// The playback on this account has now stopped
				$scope.showSpotify = false;
				sessionToken = -1;
			} else {
				// This account is currently not streaming to the device
			}
		}, function (error) {
			if(error.status === 401) {
				$scope.showSpotify = false;
				sessionToken = -1;
			}
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
	if (typeof config.spotify !== 'undefined') {
		refreshKeys = config.spotify.refreshKeys;
		updateSpotifyInterval();
	}

}

angular.module('SmartMirror')
	.controller('Spotify', Spotify);
