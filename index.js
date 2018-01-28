var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/game.html');
});
var colors = ['#2ecc71','#f1c40f','#3498db','#e74c3c','#9b59b6'];
var positions = {};




io.on('connection', function(socket){
	
	positions[socket.id] = [Math.floor(Math.random()*10),Math.floor(Math.random()*10)];
	console.log("connection, id = " + socket.id + " Position = "+ positions[socket.id]);
	socket.emit('id',socket.id);
	io.emit('position',socket.id,p);

	socket.emit('players',colors);
	socket.emit('positions',positions);
	io.emit('position',socket.id,positions[socket.id]);

	socket.on('changepos',function(p,id){
		positions[id] = p;
		console.log("Player id: " + id + " moved to x: " + p[0] + " y: " + p[1]);
		io.emit('position',id,p);
	});

	socket.on('disconnect',function(client){
		delete positions[socket.id];
		var len = Object.keys(positions).length;
		console.log("User " + socket.id + " disconnected. " + len + " players remain");
		io.emit('positions',positions);
	});
});

var p = process.env.PORT || 3000;
http.listen(p, function(){
  console.log('listening on *:'+p);
});
