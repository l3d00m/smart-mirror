function Spotify($scope, SpotifyService, SpeechService, $interval) {

    var updateSpotifyInfo = function () {
        SpotifyService.getPlaying().then(function (item) {
            $scope.spotify = item.item.name + " - " + item.item.artists[0].name;
        }, function (error) {
            $scope.spotify = {error: error};
        });
    };

    if(typeof config.spotify != 'undefined' && config.spotify.length){
        $interval(updateSpotifyInfo, 2000);
    }

}

angular.module('SmartMirror')
    .controller('Spotify', Spotify);
