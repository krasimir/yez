var app = require('http').createServer(function(){}),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    port = 9172;

app.listen(port);

io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {

    });
});

console.log('Yez is running!');