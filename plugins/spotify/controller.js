function Spotify($scope, SpotifyService, SpeechService, $interval) {
    var spotifyUpdater = function () {
        SpotifyService.getPlaying().then(function (item) {
            $scope.spotify = item.item.name + " - " + item.item.artists[0].name;
        }, function (error) {
            $scope.spotify = {error: error};
        });
    };

    $interval(spotifyUpdater, 2000)

}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);
