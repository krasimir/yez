absurd.component('Yez', {
	host: 'localhost',
	port: 9172,
	connected: false,
	connect: function() {
		if(this.connected) { return; }
		var self = this;
		this.socket = io.connect('http://' + this.host + ':' + this.port, {
			'force new connection': true
		});
		this.socket.on('connect', function () {
			self.connected = true;
			self.status.setStatus(true);
		});
		this.socket.on('disconnect', function() {
			self.connected = false;
			self.status.setStatus(false);
			self.connect();
		});
		setTimeout(function() {
			if(!self.connected) {
				self.connect();
			}
		}, 5000);
	},
	ready: function() {
		this.status = Status(this.host, this.port);
		this.connect();
	}
})();