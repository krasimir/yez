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
					//wid: '40px', 
					hei: '35px', 
					ov: 'h', 
					ta: 'c'
				}
			],
			'.task': {
				fz: '12px',
				bg: '#FFFFFF'
			},
			'.dark .task': {
				bg: 'transparent'
			},
			'.add': {
				bg: 'none',
				bdb: 'none'
			},
			'.dark .add': {
				bg: 'inherit',
				bdb: 'none'
			},
			'.add-task': {
				pos: 'a',
				right: '245px',
				top: '7px',
				wid: '85px',
			},
			'.dark .add-task': {
				right: '255px'
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
			{ 'a[href="#" data-absurd-event="click:addTask" class="button add add-task" title="New task"]': '<i class="fa fa-plus-circle"></i> Task' },
			{ 'a[href="#" data-absurd-event="click:addTerminal" class="button add add-terminal" title="New terminal"]': '<i class="fa fa-keyboard-o"></i> Terminal' },
			{ 'a[href="#" data-absurd-event="click:toHome" class="button task" title="Back to home"]': '<i class="fa fa-home"></i>' },
			'<% for(var i=0; i<tasksRunning.length; i++) { \
				var name = tasksRunning[i].name; \
				var id = tasksRunning[i].id; \
			%>',
			{ 'a[href="#" data-absurd-event="click:openTask:<% id %>" class="button task" title="<% name %>"]': '<% tasksRunning[i].name %>'},
			'<% } %>'
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
	openTask: function(e, id) {
		e.preventDefault();
		this.dispatch('open-task', {id: id});
	},
	toHome: function(e) {
		e.preventDefault();
		this.dispatch('to-home');
	},
	addTerminal: function(e) {
		e.preventDefault();
		this.dispatch('add-terminal');
	},
	addTask: function(e) {
		e.preventDefault();
		this.dispatch('add-task');
	}
});