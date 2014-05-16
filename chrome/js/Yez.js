absurd.component('Yez', {
	port: 9172,
	ready: function() {

		var status = Status();

		var socket = io.connect('http://localhost:' + this.port, {
			'force new connection': true
		});
		socket.on('connect', function () {
			status.setStatus(true);
		});
		socket.on('disconnect', function() {
			status.setStatus(false);
		});
	}
})();