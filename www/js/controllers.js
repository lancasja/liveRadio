angular.module('starter.controllers', [])

/* ========================== */
/* == SIDE MENU CONTROLLER == */
/* ========================== */
.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout) {

  /* Login code is here by default */

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

/* ==================================== */
/* == LISTEN NOW (STREAM) CONTROLLER == */
/* ==================================== */
.controller('ListenCtrl', function($scope, $rootScope, $http, AudioService) {

    // PLS file from Internet Radio
    var playlistFile = 'http://live.420radio.org:8000/listen.pls';

    $scope.init = function() {

      // Displays while getting meta data
      $scope.meta = 'Getting title of currently playing...';
      $scope.audioMeta = { "duration":0 };

      // Parse 7.html for the title of the currently playing segment
      function getMeta(url) {
            console.log("Getting live audio metadata from " + url);

        $http.get(url)
          .success(function(data) {
            var html = data;
            var body = html.substring(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
            var metaTitle = body.substring(body.lastIndexOf(',') + 1);
	    var div = document.createElement('div');
	    div.innerHTML = metaTitle;
	    $scope.meta  = div.firstChild.nodeValue;
            // $scope.meta = metaTitle;
          })
          .error(function(data) {
            console.log(data);
          });
      }

      // Get stream URL
      $http.get(playlistFile)
        .success(function(data) {
          console.log("Got playlist file " + playlistFile);

          // Parse the PLS file to get the <IP>:<PORT> for the streaming server
          var dataArray = data.split('\n');
          var url = dataArray[2].split('=')[1];
          $scope.audioSource = url + ';type=mp3';

          /*
            - Should be able to append '/status?sid=1' but it return "invalid response"
            - 7.html is deprecated by SHOUTcast but still works, maybe this is an old server?
          */

          var metaUrl = url + '7.html';

          // Get meta data and add to scope
          getMeta(metaUrl);

          // Refresh meta data every 5 seconds
          setInterval(function() {
            getMeta(metaUrl);
          }, 5000);
        })
        .error(function(data) {
          console.log(data);
        });
    }

    $scope.isPaused = true;

    $scope.playPause = function() {
      if (!AudioService.isPlaying()) {
        AudioService.createAudio($scope.audioSource, $scope.audioMeta);
        AudioService.play();
        $scope.isPaused = !$scope.isPaused;
      }

      else {

        if ($scope.audioSource === $rootScope.audio.src) {
          AudioService.pause();
          $scope.isPaused = !$scope.isPaused;
        }

        else {
          AudioService.createAudio($scope.audioSource, $scope.audioMeta);
          AudioService.play();
          $scope.isPaused = !$scope.isPaused;
        }
      }
    }
})

/* ======================== */
/* == ARCHIVE CONTROLLER == */
/* ======================== */
.controller('ArchiveCtrl', function($scope, EpisodesService) {

  // List of episodes coming from EpisodesService defined in js/app.js
  EpisodesService.getEpisodes(function(data) {
    $scope.episodes = data;
  });
  
})

/* ================================================ */
/* == EPISODE (ARCHIVE - SINGLE ITEM) CONTROLLER == */
/* ================================================ */
.controller('EpisodeCtrl', function($scope, $rootScope, $interval, $stateParams, EpisodesService, AudioService) {

  $scope.episodeId = $stateParams.episodeId;
  $scope.audioMeta = { "duration":0 };

  EpisodesService.getEpisodes(function(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i]._id === $stateParams.episodeId) {
        $scope.currentEpisode = data[i];
        $scope.pubDate = moment(data[i].pubDate).format('MMMM DD, YYYY');
      }
    }
  });

  $scope.isPaused = true;
  $scope.position = AudioService.getCurrentTime();

  $scope.playPause = function() {
    if (!AudioService.isPlaying()) {
      AudioService.createAudio($scope.currentEpisode.enclosure._url, $scope.audioMeta);
      AudioService.play();
      $scope.isPaused = !$scope.isPaused;

      $interval(function() {
        $scope.position = AudioService.getCurrentTime();
      }, 1000);
    }

    else {

      if ($rootScope.audio.src === $scope.currentEpisode.enclosure._url) {
        AudioService.pause();
        $scope.isPaused = !$scope.isPaused;
        $interval.cancel();
      }

      else {
        AudioService.createAudio($scope.currentEpisode.enclosure._url, $scope.audioMeta);
        AudioService.play();
        $scope.isPaused = !$scope.isPaused;

        $interval(function() {
          $scope.position = AudioService.getCurrentTime();
        }, 1000);
      }
    }
  };

  $scope.seeked = function() {
    $rootScope.audio.currentTime = $scope.position;
  }

});
































