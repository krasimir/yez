var Home = absurd.component('Home', {
	trayChecked: false,
	theme: true,
	html: {
		'div[data-component="home"]': [
		    { 'input[class="filter" placeholder="&#128270;" data-absurd-event="keyup:filter" autofocus]': ''},
			{ h1: '<% tasks.length > 0 ? "Your tasks:" : "" %>' },			
			'<% for(var i=0; i<tasks.length; i++) { \
				var started = tasks[i].started ? " started" : ""; \
				var name = tasks[i].name; \
				var group = tasks[i].group ? " group" : ""; \
				var grouped = tasks[i].grouped ? " grouped" : ""; \
				var id = tasks[i].id; \
			%>',
			{ 
				'div[class="task<% started %><% group %><% grouped %>"]': {
					'a[href="#" data-absurd-event="click:showTask:<% id %>" class="button" data-name="<% name %>"]': '<i class="fa <% tasks[i].started ? "fa-refresh" : "fa-stop" %>"></i> <% tasks[i].name %>',
					'a[href="#" data-absurd-event="click:runTask:<% id %>" class="button action"]': '<i class="fa fa-refresh"></i> Run',
					'a[href="#" data-absurd-event="click:stopTask:<% id %>" class="button action stop"]': '<i class="fa fa-stop"></i> Stop'
				}
			},
			'<% } %>',
			{ 'a[href="#" class="newtask" data-absurd-event="click:newTask"]': '<i class="fa fa-plus-circle"></i> New task'},
			{ 'div[class="options"]':'Options: <input type="checkbox" <% trayChecked ? "checked" : "" %> name="tray" data-absurd-event="click:trayClick"/ >Tray icon<br>Theme: <input type="radio" name="theme" data-absurd-event="click:themeClick" <% theme ? "checked" : "" %> value="light"/>Light<input type="radio" name="theme" data-absurd-event="click:themeClick" <% !theme ? "checked" : "" %> value="dark"/>Dark'}
		]
	},
	tasks: [],
	setTasks: function(ts) {
		if(ts) {
			this.tasks = [];
			for(var i in ts) {
				if(!ts[i].data.terminal) {
					this.tasks.push({ id: ts[i].getId(), name: ts[i].data.name, started: ts[i].started });
				}
			}
			this.orderTasks();
		}
		if(this.el) this.el.innerHTML = '';
		this.populate();
		return this;
	},
	showTask: function(e, id) {
		if(id != -1) {
			var current = document.querySelector('.current');
			if (current) current.classList.remove('current');
			current = document.querySelector('.'+id);
			if (current) current.classList.add('current');
			this.dispatch('show-task', id);
		}
	},
	runTask: function(e, id) {
		e.preventDefault();
		this.dispatch('run-task-silent', id);
	},
	stopTask: function(e, id) {
		e.preventDefault();
		this.dispatch('stop-task-silent', id);
	},
	newTask: function(e) {
		e.preventDefault();
		this.dispatch('new-task')
	},
	filter: function(e, dom) {
		var value = e.target.value;
		var tasksElements = this.qsa('.task');
		for(var i=0; i<tasksElements.length; i++) {
			var task = tasksElements[i];
			var name = this.qs('a', task).getAttribute('data-name');
			var r = new RegExp(value, 'i');
			if(name.match(r)) {
				task.style.display = 'block';
			} else {
				task.style.display = 'none';
			}
		}
	},
	orderTasks: function() {
		this.tasks.sort(function(a, b) {
			return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
		});
		var word = '', arr = [], added = false;
		for(var i=0; i<this.tasks.length; i++) {
			var w = this.tasks[i].name.toLowerCase().split(' ').shift();
			if(word != w) {
				word = w;
				added = false;
			} else {
				if(!added) {
					added = true;
					this.tasks[i-1].grouped = true;
					arr.splice(arr.length-1, 0, { 
						id: -1,
						group: true, 
						name: word.charAt(0).toUpperCase() + word.substr(1, word.length-1)
					});
				}
				this.tasks[i].grouped = true;
			}
			arr.push(this.tasks[i]);
		}
		this.tasks = arr;
	},
	'ctrl+i': function() {
		this.qs('.filter').focus();
	},	
	trayClick: function (event) { 
		Yez.socket.emit('data', {action: 'tray', show: event.target.checked, id: 'options'});
	},
	themeClick: function (event) { 
		Yez.socket.emit('data', {action: 'theme', theme: event.target.value, id: 'options'});
	}
});
