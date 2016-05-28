var Yez = absurd.component('Yez', {
	host: 'localhost',
	port: 9173,
	connected: false,
	tasks: {},
	beacons: {},
	defaultCWD: '',
	retry: 1,
	sep: '/',
	ready: function() {
		var self = this, showTask;

		this.populate();

		// initializing the main components
		this.status = Status(this.host, this.port);
		this.nav = Nav();
		this.content = Content();
		this.home = Home();

		// setting listeners of the navigation
		this.nav
		.on('open-task', function(data) {
			showTask(data.id);
		})
		.on('add-task', function() {
			newTask();
		})
		.on('add-terminal', this.addTerminal = function(data) {
			var newTask = self.initializeTask({ 
				terminal: true,
				name: 'Terminal', 
				cwd: self.defaultCWD,
				commands: [''],
				id: getId()
			});
			self.content.append(newTask);
			newTask.setMode('dashboard');
			newTask.started = true;
			self.tasks[newTask.getId()] = newTask;
		})
		.on('to-home', this.showHome.bind(this));

		// setting listeners of the home page
		this.home
		.on('show-task', showTask = function(id) {
			if(self.tasks[id]) {
				var t = self.tasks[id];
				t.setMode('dashboard');
				self.content.append(t);
			}
		})
		.on('run-task', function(id) {
			if(self.tasks[id]) {
				var t = self.tasks[id];
				self.content.append(t);
				t.startTasks();
			}
		})
		.on('run-task-silent', function(id) {
			if(self.tasks[id]) {
				self.tasks[id].startTasks();
				self.dispatch('tasks-updated');
			}
		})
		.on('stop-task', function(id) {
			if(self.tasks[id]) {
				var t = self.tasks[id];
				self.content.append(t);
				t.stopTasks();
			}
		})
		.on('stop-task-silent', function(id) {
			if(self.tasks[id]) {
				self.tasks[id].stopTasks();
				self.dispatch('tasks-updated');
			}
		})
		.on('new-task', newTask = function() {
			var newTask = self.initializeTask();
			self.content.append(newTask);
			newTask.goToEditMode();
		});
		this.connect();
	},

	connect: function() {

		if(this.connected) { return; }

		var self = this;

		try {
			self.ipc = require('electron').ipcRenderer;
			self.ipc.on('theme', function(event, data) { 
				self.socket.emit('data', {action: 'theme', theme: data, id: 'ipc'});
			});
			self.ipc.on('tray', function(event, data) { 
				self.socket.emit('data', {action: 'tray', show: data, id: 'ipc'});
				console.log('ipc tray', {action: 'tray', show: data, id: 'ipc'});
			});
		} catch (error) {
		  // console.log('this is not an electron window');
		}
		this.socket = io.connect('http://' + this.host + ':' + this.port, {
			'force new connection': true
		});
		this.socket.on('connect', function (data) {
			self.retry = 1;
			self.connected = true;
			self.status.setStatus(true);
			self.nav.visible(true);
			self.content.visible(true);			
		});
		this.socket.on('disconnect', function() {
			self.connected = false;
			self.status.setStatus(false, self.retry);
			self.nav.visible(false);
			self.content.visible(false);
			self.connect();
		});
		this.socket.on('initial', function(data) {		
			self.sep = data.sep;
			self.savedAliases = data.aliases || '';
			self.defaultCWD = normalizePath(data.cwd);
			self.setTasks(data);
			if (data.tray) {
				self.toggleTray({show: 'true'});
			}
			if (data.dark) {
				self.setTheme({theme: 'dark'});
			}
		});
		this.socket.on('response', function(data) {
			if(self.tasks[data.id]) {
				self.tasks[data.id].response(data);
			}
		});
		this.socket.on('beacon-response', function(data) {
			if(self.beacons[data.id]) {
				self.beacons[data.id](data);
			}
		});
		this.socket.on('tray', function(data) {
		    if (Yez.ipc) Yez.ipc.send('data', data);
			self.toggleTray(data);
		});		 
		this.socket.on('theme', function(data) {
		    if (Yez.ipc) Yez.ipc.send('data', data);
			self.setTheme(data);
		});
		this.socket.on('updateTasks', function(data) { 
		    self.setTasks(data);
		});
		this.socket.on('updateAliases', function(data) { 
		    this.savedAliases = data.aliases;
		});
		setTimeout(function() {
			if(!self.connected) {
				self.retry += 1;
				self.status.setStatus(false, self.retry);
				self.connect();
			}
		}, 5000);
		// showing home page and enabling the key binding
        this.showHome().initializeKeyPress();
		return this;
	},
	toggleTray: function (data) {
		var checked = Boolean(data.checked) || Boolean(data.show);
		this.qs('input[name=tray]').checked = checked;
		this.home.trayChecked = checked;
	},
	setTheme: function (data) {
		this.qs('input[name=theme][value=dark]').checked = (data.theme == 'dark');
		this.qs('input[name=theme][value=light]').checked = (data.theme == 'light');
		this.home.theme = (data.theme == 'light');			
		document.body.className = data.theme;
	},
	initializeTask: function(data) {
		var self = this;
		var t = Task(data || {
			name: 'Task',
			cwd: this.defaultCWD,
			commands: [''],
			id: getId()
		});
		t.on('data', function(data) {
			delete data.target;
			if(self.socket && self.connected) {
				self.socket.emit('data', data);
			} else {
				t.response({ action: 'error', msg: 'No back-end!' });
			}
		})
		.on('save', function() {
			self.tasks[t.getId()] = t;
			self.dispatch('tasks-updated');
		})
		.on('home', this.showHome.bind(this))
		.on('delete-task', function() {
			delete self.tasks[t.data.id];
			self.dispatch('tasks-updated').showHome();
		})
		.on('ended', function() {
			self.dispatch('tasks-updated')
		});
		return t;
	},
	showHome: function() {
		this.content.append(this.home.setTasks(this.tasks));
		return this;
	},
	setTasks: function(data) {
		this.tasks = [];
		var ts = JSON.parse(data.tasks);
		for(var i=0; i<ts.length; i++) {
			var t = this.initializeTask(ts[i]);
			this.tasks[t.data.id] = t;
		}
		// marking tasks as started
		if(data.running && data.running.length > 0) {
			for(var i=0; i<data.running.length; i++) {
				if(this.tasks[data.running[i].id]) {
					var t = this.tasks[data.running[i].id];
					t.started = true;
					t.populate();
				}
			}				
		}
		// remove the started state
		for(id in this.tasks) {
			var t = this.tasks[id];
			if(t.started) {
				var isItReally = false;
				for(var i=0; i<data.running.length; i++) {
					if(t.data.id === data.running[i].id) {
						isItReally = true;
					}
				}
				if(!isItReally) {
					console.log('no it is not');
				}
			}
		} console.log(this.tasks)
		this.home.setTasks(this.tasks);	
	},
	saveTasks: function() {
		var tasks = [];
		for(var id in this.tasks) {
			if(!this.tasks[id].data.terminal) {
				tasks.push(this.tasks[id].data);
			}
		}
		this.socket.emit('data', {action: 'saveTasks', tasks: JSON.stringify(tasks), id: 'tasks'});
		return this;
	},
	send: function(data, cb) {
		data.id = data.id || getId();
		this.beacons[data.id] = cb;
		data.target && (delete data.target);
		if(this.socket && this.connected) {
			this.socket.emit('data', data);
		} else {
			cb({ action: 'error', msg: 'No back-end!' });
		}
	},
	initializeKeyPress: function() {
		var keypress = new window.keypress.Listener(), self = this;
		keypress.simple_combo("ctrl l", function() {
			self.content.passKeypressSignal('ctrl+l');
		});
		keypress.simple_combo("ctrl enter", function() {
			self.content.passKeypressSignal('ctrl+enter');
		});
		keypress.simple_combo("ctrl i", function() {
			self.content.passKeypressSignal('ctrl+i');
		});
		keypress.simple_combo("ctrl c", function() {
			self.content.passKeypressSignal('ctrl+c');
		});
		keypress.simple_combo("ctrl \\", function() {
			self.addTerminal();
		});
		return this;
	},
	aliases: function(value) { console.log(value)
		if(value) {
			this.socket.emit('data', {action: 'aliases', aliases: value, id: 'tasks'});
		    this.savedAliases = value;
		}
		return this.savedAliases || '';
	},
	'tasks-updated': function() {
		this.home.setTasks(this.tasks);
		this.saveTasks();
	}
})();
