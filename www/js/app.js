'use strict';

var app = angular.module('kvoice', ['ionic', 'ionic-material', 'kvoice.services']);

// var isProduction = false;
var isProduction = true;

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function ($stateProvider, $urlRouterProvider, $logProvider, $provide) {
  if(isProduction) {
//   if (config.isProduction) {
//     $logProvider.debugEnabled(true);
    $logProvider.debugEnabled(false);
    $provide.decorator('$log', ['$delegate', function ($delegate) {
      $delegate.table = angular.noop;
      return $delegate;
    }]);
    $provide.decorator('$log', ['$delegate', function ($delegate) {
      $delegate.info = angular.noop;
      return $delegate;
    }]);
    $provide.decorator('$log', ['$delegate', function ($delegate) {
      $delegate.warn = angular.noop;
      return $delegate;
    }]);
    $provide.decorator('$log', ['$delegate', function ($delegate) {
      $delegate.error = angular.noop;
      return $delegate;
    }]);
  }


  $stateProvider
    .state('app', {
      url: '/app',
      cache: false,
      templateUrl: 'templates/main.html',
      controller: 'appCtrl'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app');
});


