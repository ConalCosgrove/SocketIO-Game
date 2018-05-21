var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var sjcl = require('sjcl');
app.get('/', function(req, res){
	res.sendFile(__dirname + '/pin.html');
});
var colors = ['#2ecc71','#f1c40f','#3498db','#e74c3c','#9b59b6'];
var positions = {};
var names = {};



io.on('connection', function(socket){
	
	positions[socket.id] = [Math.floor(Math.random()*20),Math.floor(Math.random()*20)];
	console.log("connection, id = " + socket.id + " Position = "+ positions[socket.id]);
	socket.emit('id',socket.id);
	io.emit('position',socket.id,p);

	socket.emit('players',colors);
	socket.emit('positions',positions);
	socket.emit('names',names);
	io.emit('position',socket.id,positions[socket.id]);

	socket.on('changepos',function(p,id){
		positions[id] = p;
		console.log("Player id: " + id + " moved to x: " + p[0] + " y: " + p[1]);
		io.emit('position',id,p);
	});

	socket.on('name',function(n){
		names[socket.id] = n
		io.emit('names',names);
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







