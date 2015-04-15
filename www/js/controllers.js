angular.module('starter.controllers', [])

/* ========================== */
/* == SIDE MENU CONTROLLER == */
/* ========================== */
.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout) {

  // http://forum.ionicframework.com/t/multiple-modals/11187/2
  
  // Create sponsor modal
  $ionicModal.fromTemplateUrl('templates/sponsor.html', {
    id: 1,
    scope: $scope
  }).then(function(modal) {
    $scope.sponsorModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/legal-modal.html', {
    id: 2,
    scope: $scope
  }).then(function(modal) {
    $scope.legalModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/attrib-modal.html', {
    id: 3,
    scope: $scope
  }).then(function(modal) {
    $scope.attribModal = modal;
  });

  // Triggered in the sponsor modal to close it
  $scope.close = function(index) {
    if (index == 1) {
      $scope.sponsorModal.hide();
    }

    else if (index == 2) {
      $scope.legalModal.hide(); 
    }

    else if (index == 3) {
      $scope.attribModal.hide(); 
    }
  };

  // Open the sponsor modal
  $scope.modal = function(index) {
    if (index == 1) {
      $scope.sponsorModal.show();
    }

    else if (index == 2) {
      $scope.legalModal.show(); 
    }

    else if (index == 3) {
      $scope.attribModal.show(); 
    }
  };
})

/* ==================================== */
/* == LISTEN NOW (STREAM) CONTROLLER == */
/* ==================================== */
.controller('ListenCtrl', function($scope, $rootScope, $http, AudioService) {
    // Track this controller
    if (typeof analytics !== 'undefined') {
      analytics.trackView('Listen Now Controller');
    }

    var playlistFile = 'http://live.420radio.org:8000/listen.pls';

    $scope.init = function() {

      // Displays while getting meta data
      $scope.meta = 'Getting title of currently playing...';
      $scope.audioMeta = { "duration":  0 };

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

  // Track this controller
  if (typeof analytics !== 'undefined') {
    analytics.trackView('Archive Controller');
  }

  // List of episodes coming from EpisodesService defined in js/app.js
  EpisodesService.getEpisodes(function(data) {
    $scope.episodes = data;
  });
  
})

/* ================================================ */
/* == EPISODE (ARCHIVE - SINGLE ITEM) CONTROLLER == */
/* ================================================ */
.controller('EpisodeCtrl', function($scope, $rootScope, $interval, $stateParams, EpisodesService, AudioService) {

  // Track this controller
  if (typeof analytics !== 'undefined') {
    analytics.trackView('Archive Controller');
  }

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
































