const axios = require("axios");
const http = require("http");
const net = require('net');
const url = require("url");


var port = 4000;
var host = "127.0.0.1";
//Create the proxy

var options = {
  host: 'www.google.com',
  port: 80,
  path: '/index.html'
};



var proxyServer = http.createServer(function(req,res) {

  	var requestUrl = url.parse(req.url,true);

  	var hostName = req.url.split(':')[0];

  	var portNumber = req.url.split(':')[1]
  	


  	var requestToServer = http.request({
      	port: 80,
      	host: requestUrl.host,
      	method: req.headers['method'],
      	path: requestUrl.path
  	});


  	requestToServer.end();
  	requestToServer.on('error',console.log)

  	//Proxy Response handler
  	requestToServer.on('response', function (p_res) {

    	p_res.on('data', function(chunk) {
     		res.write(chunk, 'binary');
    	});
    	p_res.on('end', function() {
    		
      		res.end();
    	});
    	res.writeHead(p_res.statusCode, p_res.headers);
  	});

  	req.on('data', function(chunk) {
  		if(!requestToServer.finished){
    		requestToServer.write(chunk, 'binary');
    	}	

  	});


  	req.on('end', function() {
    	requestToServer.end();
  	});
}).listen(port, host);



//Attempting to deal with HTTPS
proxyServer.addListener('connect', function (req, b_socket, bodyhead) {

  	p_url = url.parse('https://'+req.url,true);
  	console.log("p_url = " + p_url);

  	var hostName = req.url.split(':')[0];
  	var portNumber = req.url.split(':')[1]
  	console.log("Request recieved for:"+hostName+":"+portNumber); 

  	//Create proxy-server socket and establish a connection with the server
  	var p_socket = new net.Socket();
  	p_socket.connect(portNumber, hostName, function () {
      		p_socket.write(bodyhead);
      		b_socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    	}
  	);

  	//Finish browser-proxy socket when proxy-server socket is finished or breaks
  	p_socket.on('end', function () {
    	b_socket.end();
  	});
  	p_socket.on('error', function () {
    	b_socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
    	b_socket.end();
  	});

  	//Tunnel data from each socket out the other
  	b_socket.on('data', function (chunk) {
    	p_socket.write(chunk);
  	});
  	p_socket.on('data', function (chunk) {
    	b_socket.write(chunk);
  	});

  	//Finish proxy-server socket when browser-proxy socket is finished or breaks
  	b_socket.on('end', function () {
    	p_socket.end();
  	});
  	b_socket.on('error', function () {
    	p_socket.end();
  	});

});

