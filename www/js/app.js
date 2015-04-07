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
    
    if (window.StatusBar) {
      org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // This works in the iOS simulator but not on a device
    $cordovaStatusbar.hide();

    // Controll duration of the splash screen in milliseconds
    setTimeout(function() {
      $cordovaSplashscreen.hide();
    }, 60);

  });
})

/* ============== */
/* == SERVICES == */
/* ============== */
// Service to share RSS feed as JSON data across the app
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

        // Handle data in the controller as a callback function
        callback(episodes);
      });
    }
  }
})

/* ============ */
/* == ROUTES == */
/* ============ */
.config(function($stateProvider, $urlRouterProvider) {
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
