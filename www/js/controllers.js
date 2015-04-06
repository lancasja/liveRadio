angular.module('starter.controllers', [])

/* ===================== */
/* == MAIN CONTROLLER == */
/* ===================== */
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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
.controller('ListenCtrl', function($scope, $http) {

    var playlistFile = 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=172366';

    $scope.init = function() {
      $scope.isPlaying = false;
      $scope.audio = new Audio();
      $scope.meta = 'Getting title of currently playing...';

      $http.get(playlistFile)
        .success(function(data) {
          var dataArray = data.split('\n');
          var url = dataArray[2].split('=')[1];
          $scope.audio.src = url + '/;type=mp3';
          var metaUrl = url + '/7.html';

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

    function getMeta(url) {
      $http.get(url)
        .success(function(data) {
          var html = data;
          var body = html.substring(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
          var metaTitle = body.substring(body.lastIndexOf(',') + 1);

          $scope.meta = metaTitle;
        })
        .error(function(data) {
          console.log(data);
        });
    }

    $scope.play = function() {
      if ($scope.audio.paused) {
        $scope.audio.play();
        $scope.isPlaying = !$scope.isPlaying;
      }
    }

    $scope.pause = function() {
      if (!$scope.audio.paused) {
        $scope.audio.pause();
        $scope.isPlaying = !$scope.isPlaying;
      }
    }
})

/* ======================== */
/* == ARCHIVE CONTROLLER == */
/* ======================== */
.controller('ArchiveCtrl', function($scope, $http) {
  
  $scope.init = function() {
    $http.get('http://ajax.googleapis.com/ajax/services/feed/load', {
      params: {
        'v': '1.0',
        'q': 'http://420radio.org/shows/rbs/feed/',
        'num': '10',
        'output': 'json_xml'
      }
    })
    .success(function(data) {

      // Get XML data as string
      var xmlString = data.responseData.xmlString;

      // Convert to JSON with X2JS [https://code.google.com/p/x2js/]
      var x2js = new X2JS();
      var jsonFeed = x2js.xml_str2json(xmlString);

      var items = jsonFeed.rss.channel.item;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];

        var title = item.title;
        var a = title.indexOf('#') + 1;
        var itemId = title.substring(a, a + 3);
        
        item._id = itemId;
      }

      // Array of episodes
      $scope.episodes = jsonFeed.rss.channel.item;
    })
    .error(function(data) {
      console.log(data);
    });
  }
})

/* ====================================== */
/* == ARCHIVE - SINGLE ITEM CONTROLLER == */
/* ====================================== */
.controller('EpisodeCtrl', function($scope, $stateParams) {

  $scope.episodeId = $stateParams.episodeId;

});
































