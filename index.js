var Hapi = require("hapi");

var server = new Hapi.Server(8001, "localhost");
require("./db");

var alphanumExp = /^[a-z0-9]+$/i;
server.start(function(){
  console.log("Hapi server started @", server.info.uri);
});



server.route({
  path: "/{path*}",
  method: "GET",
  handler: {
    directory: {
      path: "./public",
      listing: false,
      index: false
    }
  }
});

server.route({
  path: "/",
  method: "GET",
  handler: function(request, reply) {
    reply("Hello");
  }
});


server.route({
  path: "/api/all",
  method: "GET",
  handler: function list(request, reply) {
    var item = require('./db/models/item.js');
    item.findAll(function (err, result) {
      if (err) {
        reply({error: "There was an error getting all the hackers."});
      }
      else {
        reply(result);
      }
    })
  }
});

server.route({
  path: "/api/{type}",
  method: "GET",
  handler: function list(request, reply) {
    if(!request.params.type.match(alphanumExp)){
      reply({error: "Please insert a valid type"});
    }
    var item = require('./db/models/item.js');
    item.number(request.params.type,function (err, result) {
      if (err) {
        reply({error: "There was an error getting all the hackers."});
      }
      else {
        reply(result);
      }
    })
  }
});

server.route({
  path: "/api/remove/{id}",
  method: "DELETE",
  handler: function create(request, reply) {
    if(!request.params.id.match(alphanumExp)){
      reply({error: "Please insert a valid id"});
      return;
    }
    var item = require('./db/models/item.js');

    item.countWithId(request.params.id,function(err,result){
      if(err || result < 1){
        reply({error: "Item doesn't exit"});
      }else{
        item.remv(request.params.id,function (err, result) {
          if (err) {
            reply({error: "There was an error deleting item"});
          }
          else {
            reply({success: "Item removed"});
          }
        })
      }
    })
  }

})

server.route({
  path: "/api/{type}/{number}",
  method: "POST",
  handler: function create(request, reply) {

    if(!request.params.type.match(alphanumExp)){
      reply({error: "Please insert a valid type"});
    }
    var itemModel = require('./db/models/item.js');
    if( !isNaN(request.params.number)){
      reply({error: "Please insert a number of "+request.params.type+" to add"});
      return;
    }
    for(var i = 0; i <request.params.number; i++){
      var item = new itemModel(request.payload);
      item.timestamp = Date.now();
      item.type = request.params.type; 
      item.save(function (err) {
        if (err) {
          reply({error: "There was an error creating the item."});
        }       
        else {
          reply({success: "item created."});
        }
      });
    }
  }
});

