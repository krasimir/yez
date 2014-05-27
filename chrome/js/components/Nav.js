var Nav = absurd.component('Nav', {
	css: {
		'[data-component="nav"]': {
			fl: 'l',
			pad: '6px 0 0 10px',
			d: 'n',
			a: [
				button(),
				{ 
					bxz: 'bb', 
					wid: '40px', 
					hei: '35px', 
					ov: 'h', 
					ta: 'c'
				}
			],
			'.task': {
				fz: '12px',
				bg: '#FFFFFF'
			},
			'.add': {
				bg: 'none',
				bdb: 'none'
			},
			'.add-task': {
				pos: 'a',
				right: '245px',
				top: '7px',
				wid: '85px'
			},
			'.add-terminal': {
				pos: 'a',
				right: '142px',
				top: '7px',
				wid: '108px'
			}
		}
	},
	html: {
		'nav[data-component="nav"]': [
			'<% for(var i=0; i<tasksRunning.length; i++) { var name = tasksRunning[i].name; %>',
			{ 'a[href="#" data-absurd-event="click:openTask:<% i %>" class="task" title="<% name %>"]': '<% tasksRunning[i].name.substr(0, 3) + "..." %>'},
			'<% } %>',
			{ 'a[href="#" data-absurd-event="click:addTask" class="add add-task" title="Terminal"]': '<i class="fa fa-plus-circle"></i> Task' },
			{ 'a[href="#" data-absurd-event="click:addTerminal" class="add add-terminal" title="Terminal"]': '<i class="fa fa-keyboard-o"></i> Terminal' },
		]
	},
	tabs: [],
	running: 0,
	tasksRunning: [],
	constructor: function(dom) {
		dom('[data-placeholder="nav"]').el.appendChild(this.populate().el);
		this.startCheckingTasks();
	},
	visible: function(s) {
		this.css['[data-component="nav"]'].d = s ? 'b' : 'n';
		this.populate();
	},
	startCheckingTasks: function() {
		var tasks = Yez.tasks, running = 0, self = this;
		this.tasksRunning = [];
		for(var id in tasks) {
			var t = tasks[id];
			if(t.started) {
				running += 1;
				this.tasksRunning.push({id: id, name: t.data.name});
			}
		}
		if(running != this.running) {
			this.running = running;
			this.populate();
		}
		setTimeout(function() {
			self.startCheckingTasks();
		}, 300);
	},
	openTask: function(e, index) {
		e.preventDefault();
		index = parseInt(index);
		if(this.tasksRunning[index]) {
			this.dispatch('open-task', {id: this.tasksRunning[index].id});
		}
	},
	addTerminal: function(e) {
		this.dispatch('add-terminal');
	},
	addTask: function(e) {
		this.dispatch('add-task');
	}
});