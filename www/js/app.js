// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $cordovaStatusbar, $cordovaSplashscreen) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      // StatusBar.styleDefault();
    }

    $cordovaStatusbar.hide();

    setTimeout(function() {
      $cordovaSplashscreen.hide();
    }, 60);

  });
})

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
