/**
 * Created by yeoshim on 2017. 2. 26..
 */
'use strict';

var srv = angular.module('kvoice.services', []);

srv.factory('Loading', function( $ionicLoading ){
  var showing = false;

  var Loading = {
    isShowing: function () {
      return showing;
    },
    show: function(loadingText){
      showing = true;
      return $ionicLoading.show({
        template: '<div><ion-spinner class="spinner-light" icon="lines"/></div><div style="max-width:140px;">' + loadingText + '</div>'
      }).then(function(){
        });
    },
    hide: function(){
      showing = false;
      return $ionicLoading.hide()
        .then(function(){
        });
    }
  }
  return Loading;
});
