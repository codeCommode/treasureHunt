angular.module('treasureHunt.services', ['ngFileUpload'])
.factory('RequestFactory', ['$http', '$location', function($http, $location){
  var gameId = "";
  var games = [];
  var currentGame = {};

  gameSetup = function(){
    if(Array.isArray(currentGame.nodes)){
      currentGame.nodes.forEach(function(node){
        node.found=false;
      });
    }
  };

  return {
    gameId : gameId,
    getGameId : function(){
      return gameId;
    },
    postNewGame: function(gameName, gameDescription){
      $http.post('/createGame', { gameName: gameName, gameDescription: gameDescription })
        .then( function(resp){
          gameId = resp.data.gameId;
          console.log("Game created with ID: " + gameId);
        }, function(err){
          console.error('Error ',err);
        });        
    },

    getGames: function(){
      return $http.post('/games').then(function(resp){
        return resp.data;
      });
    },
    getGame:function(gameId, cb){
      $http.post('/game', {
        gameId:gameId
      })
      .then(function(results){
        currentGame.nodes = results.data;
        currentGame = {
          name:results.data[0].gameName,
          description: results.data[0].description,
          nodes:results.data
        };
        gameSetup();
      }, function(err){
        console.error(err);
      })
    }, 
    getGameInfo: function(gameId, cb){
      $http.post('/gameInfo', {
        gameId:gameId
      })
        .then(function(results, err){
          currentGame = {
            name: results.data.gameName,
            description: results.data.description,
            createdDate: results.data.createdDate
          };
          cb(results);
        },function(err){
          console.error(err);
        }
      )
    },
    getNode:function(nodeNum){
      if(currentGame.nodes){
        return currentGame.nodes[nodeNum];
      }
      return null;
    }

  }
}])

.factory('SendPicAndLoc', ['$rootScope', '$http', '$location', 'Upload', 'RequestFactory',
  function($rootScope, $http, $location, Upload, RequestFactory){

    function postPic(file, loc, clue){
      Upload.upload({
        url:'/addWaypoint',
        file: file,
        data:{
          gameId : RequestFactory.getGameId(),
          latitude : loc.coords.latitude,
          longitude : loc.coords.longitude,
          clue: clue
        }})
        .success(function(data, status, headers, config){
          console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
        })
        .error(function(data, status, headers, config){
          console.log('error status: ', status);
        })
    };

    return {
      loc:null,
      clue:'',
      getLoc:function(){
        if(navigator && navigator.geolocation){
          navigator.geolocation.getCurrentPosition(function(data){
            this.loc = data;
            $rootScope.$broadcast('locReady');
          }.bind(this))
        }
      },
      sendPic:function(file){
        postPic(file, this.loc, this.clue);
      }
    };
}])

// invitePlayers method will submit post request to '/invite' with array of invities and server will email each invitee
.factory('InvitePlayers', ['$http', '$location', 'RequestFactory', function($http, $location, RequestFactory){
  return {
    invitePlayers: function(arrayOfEmailAddresses){
      console.log(arrayOfEmailAddresses + " in invite players");
      $http.post('/invite', { inviteeEmailAddresses: arrayOfEmailAddresses, gameId: RequestFactory.getGameId() })
        .then(function(resp){
          // on success
          
        }, function(resp){
          // on failure
          console.log(resp.data);
        })
    }
  };
}])

.factory('geo', [function(){
  return {
    distance:function(lat1, lon1, lat2, lon2){
      /* implemented from https://en.wikipedia.org/wiki/Great-circle_distance */
      var c = Math.PI/180;
      lat1 = lat1*c;
      lat2 = lat2*c;
      lon1 = lon1*c;
      lon2 = lon2*c;
      return 6371000 * 2 * Math.asin(Math.sqrt(
          Math.sin((lat2-lat1) / 2) * Math.sin((lat2-lat1) / 2) + Math.cos(lat1)*Math.cos(lat2)*
          Math.sin((lon2-lon1) / 2) * Math.sin((lon2-lon1) / 2)
        ));
    },
  };
}]);




