// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

/* ============= */
/* == STARTUP == */
/* ============= */
.run(function($ionicPlatform, $cordovaStatusbar, $cordovaSplashscreen) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    

    // Controll duration of the splash screen in milliseconds
    setTimeout(function() {
      $cordovaSplashscreen.hide();
    }, 5000);

    // Google Analytics
    // https://blog.nraboy.com/2014/06/using-google-analytics-ionicframework/
    if (typeof analytics !== 'undefined') {
      analytics.startTrackerWithId('UA-61555293-1');
    } else {
      console.log('Google Analytics not started.');
    }

  });
})

/* ============== */
/* == SERVICES == */
/* ============== */
// Share RSS feed as JSON data across the app
.factory('EpisodesService', function($http) {

  return {
    getEpisodes: function(callback) {

      // Ping Google Feed API, return the latest 10 entries
      $http.get('http://ajax.googleapis.com/ajax/services/feed/load', {
        params: {
          'v': '1.0',
          'q': 'http://420radio.org/shows/rbs/feed/',
          'num': '10',
          'output': 'json_xml'
        }
      }).success(function(data) {

        // Using MIXED_MODE with the feed API so it adds an addition xmlString property
        var xmlString = data.responseData.xmlString;

        // Use X2JS library to convert XML to JSON [https://code.google.com/p/x2js/]
        var x2js = new X2JS();
        var jsonFeed = x2js.xml_str2json(xmlString);
        var episodes = jsonFeed.rss.channel.item;

        /*
          Loop through the list of episodes, parse the title for the # and assign it as an id to use in the detail view.
        */ 
        for (var i = 0; i < episodes.length; i++) {
          var item = episodes[i];
          var title = item.title;
          var itemId = title.substring(title.indexOf('#') + 1, title.indexOf('#') + 4);
          
          item._id = itemId;
        }

        // Handle data in the controller as a callback function
        callback(episodes);
      });
    }
  }
})

.factory('AudioService', function($rootScope) {
  return {
    
    createAudio: function(src, audioMeta) {
      console.log("createAudio called with " + src + " URL and audioMeta.duration " + audioMeta.duration);
      if (!$rootScope.audio) {
        console.log('$rootScope.audio does NOT exist. Creating one.');
        $rootScope.audio = new Audio(src);
        $rootScope.audio.addEventListener('loadedmetadata', function() {
                                console.log("New audio INSTANCE: Playing " + $rootScope.audio.src + ", for: " + $rootScope.audio.duration + "seconds.");
                                audioMeta.duration = $rootScope.audio.duration;
                                });
      }

      else {
        console.log('$rootScope.audio DOES exist!');

        if ($rootScope.audio.src === src) {
          console.log('Current source and sleected source are the same.');
        }

        else {
          console.log('Current source and sleected source are different. Setting new source.');
          $rootScope.audio.src = '';
          $rootScope.audio.src = src;
          $rootScope.audio.addEventListener('loadedmetadata', function() {
                                console.log("New audio SOURCE: Playing " + $rootScope.audio.src + ", for: " + $rootScope.audio.duration + " seconds.");
                                audioMeta.duration = $rootScope.audio.duration;
                                });
        }
      }
    },

    play: function() {
      if ($rootScope.audio.paused) {
        console.log('Starting playback.');
        $rootScope.audio.play();
      }

      else if (!$rootScope.audio.paused) {
        console.log('Audio is playing. Doing nothing.')
      }
    },

    pause: function() {
      if (!$rootScope.audio.paused) {
        console.log('Pausing playback.');
        $rootScope.audio.pause();
      }

      else if ($rootScope.audio.paused) {
        console.log('No audio is playing. Doing nothing.');
      }
    },

    isPlaying: function() {
      return $rootScope.audio ? !$rootScope.audio.paused : false;
    },

    getCurrentTime: function() {
      return $rootScope.audio ? $rootScope.audio.currentTime : 0;
    }

  };
})

/* ============= */
/* == FILTERS == */
/* ============= */
.filter('moment', function() {
  return function(date) {
    return moment(date).format('MMMM DD, YYYY');
  }
})

// http://stackoverflow.com/a/28401099
.filter('secondsToDateTime', function() {
  return function(seconds) {
    return new Date(1970, 0, 1).setSeconds(seconds);
  };
})

/* ============ */
/* == ROUTES == */
/* ============ */
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.backButton.text('');
  $ionicConfigProvider.views.forwardCache(true);
  $ionicConfigProvider.navBar.alignTitle('center');

  if (ionic.Platform.isIOS()) {
    $ionicConfigProvider.backButton.previousTitleText('');
  }

  $stateProvider

  // Menu Drawer
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  // Primary View
  .state('app.primary', {
    url: "/primary",
    views: {
      'menuContent': {
        templateUrl: "templates/primary.html"
      }
    }
  })

  // Listen Now
  .state('app.listenNow', {
    url: "/listenNow",
    views: {
      'menuContent': {
        templateUrl: "templates/listenNow.html",
        controller: "ListenCtrl"
      }
    }
  })

  // Archive
  .state('app.archive', {
    url: "/archive",
    views: {
      'menuContent': {
        templateUrl: "templates/archive.html",
        controller: 'ArchiveCtrl'
      }
    }
  })

  // Archive Item
  .state('app.single', {
    url: "/archive/:episodeId",
    views: {
      'menuContent': {
        templateUrl: "templates/episode.html",
        controller: 'EpisodeCtrl'
      }
    }
  });
  
  // Default View
  $urlRouterProvider.otherwise('/app/primary');
});
