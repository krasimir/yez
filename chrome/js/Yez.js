absurd.component('Yez', {
	css: {
		'body, html': {
			wid: '100%', hei: '100%',
			mar: 0, pad: 0,
			// ff: "'Roboto', 'sans-serif'",
			ff: 'Arial',
			fz: '16px', lh: '26px'
		},
		'.left': { fl: 'l' },
		'.right': { fl: 'r' },
		'code': {
			bd: 'solid 1px #D8D8D8',
			pad: '0 2px 0 2px'
		},
		'.clear, .clearfix': {
			clear: 'both'
		},
		'header': {
			bg: '#F3EEE4',
			bdb: 'solid 2px #DFD2B7',
			'.logo': {
				d: 'b', fl: 'l',
				mar: '0 4px 0 10px'
			},
			'&:after': {
				d: 'tb',
				content: '" "',
				clear: 'both'
			}
		},
		hr: {
			bdt: 'none', bdb: 'dotted 1px #999',
			mar: '0 10px'
		}
	},
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
			self.nav.visible(true);
			self.content.visible(true);
		});
		this.socket.on('disconnect', function() {
			self.connected = false;
			self.status.setStatus(false);
			self.nav.visible(false);
			self.content.visible(false);
			self.connect();
		});
		setTimeout(function() {
			if(!self.connected) {
				self.connect();
			}
		}, 5000);
	},
	ready: function() {

		this.populate();

		this.status = Status(this.host, this.port);
		this.nav = Nav();
		this.content = Content();

		this.nav.on('new', function() {
			this.content.append(Task())
		}.bind(this));

		this.connect();

		// debug
		this.content.append(Task({
			name: 'blah',
			cwd: 'D:/work/',
			commands: ['ls', 'git status']
		}));
	}
})();