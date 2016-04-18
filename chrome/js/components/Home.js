var Home = absurd.component('Home', {
	css: HomeCSS(),
	html: {
		'div[data-component="home"]': [
			{ h1: '<% tasks.length > 0 ? "Your tasks:" : "" %>' },
			{ 'input[class="filter" data-absurd-event="keyup:filter" autofocus]': ''},
			'<% for(var i=0; i<tasks.length; i++) { \
				var started = tasks[i].started ? " started" : ""; \
				var name = tasks[i].name; \
				var group = tasks[i].group ? " group" : ""; \
				var grouped = tasks[i].grouped ? " grouped" : ""; \
				var id = tasks[i].id; \
			%>',
			{ 
				'div[class="task<% started %><% group %><% grouped %>"]': {
					'a[href="#" data-absurd-event="click:showTask:<% id %>" data-name="<% name %>"]': '<i class="fa <% tasks[i].started ? "fa-refresh" : "fa-stop" %>"></i> <% tasks[i].name %>',
					'a[href="#" data-absurd-event="click:runTask:<% id %>" class="action"]': '<i class="fa fa-refresh"></i> Run',
					'a[href="#" data-absurd-event="click:stopTask:<% id %>" class="action stop"]': '<i class="fa fa-stop"></i> Stop'
				}
			},
			'<% } %>',
			{ 'a[href="#" class="newtask" data-absurd-event="click:newTask"]': '<i class="fa fa-plus-circle"></i> New task'}
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
			this.dispatch('show-task', id);
		}
	},
	runTask: function(e, id) {
		e.preventDefault();
		this.dispatch(e.ctrlKey === false ? 'run-task' : 'run-task-silent', id);
	},
	stopTask: function(e, id) {
		e.preventDefault();
		this.dispatch(e.ctrlKey === false ? 'stop-task' : 'stop-task-silent', id);
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
	appended: function(dom) {
		setTimeout(function() {
			dom('.filter').el.focus();
		}, 300);
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
	}
});
function HomeCSS() {
	return {
		'[data-component="home"]': {
			bxz: 'bb',
			pad: '14px',
			h1: {
				pad: 0,
				mar: '0 0 17px 0',
				color: '#ddd'
			},
			'.task': {
				pos: 'r',
				a: [
					button(),
					{
						d: 'b',
						mar: '0 0 6px 0',
						bg: '#333'
					}
				],
				'a.action': {
					pos: 'a',
					top: 0,
					right: 0,
					bg: '#3e9828',
					bdb: 'n',
					wid: '60px',
					ta: 'c',
					bdtlrs: '0',
					bdblrs: '0',
					'&:hover': {
						bg: '#4EC730'
					}
				},
				'a.action.stop': {
					d: 'n',
					bg: '#E83E3E',
					color: '#ddd',
					'&:hover': {
						bg: '#ED6565'
					}
				}
			},
			'.started': {
				'a.action': {
					d: 'n'
				},
				'a.action.stop': {
					d: 'b'
				}
			},
			'.grouped': {
				ml: '30px',
				'&:before': {
					d: 'b',
					pos: 'a',
					content: '" "',
					width: '19px',
					height: '10px',
					bdb: 'solid 2px #000',
					bdl: 'solid 2px #000',
					top: '8px',
					left: '-28px'
				}
			},
			'.group': {
				'a.action': { d: 'n' },
				'a': {
					color: '#8E8E8E',
					fz: '20px',
					pad: '4px 0',
					cursor: 'default',
					bg: 'none',
					bdb: 'none',
					i: { d: 'n' },
					'&:hover': {
						bg: 'none'
					}
				}
			},
			'.newtask': {
				d: 'b',
				mar: '10px 0 0 10px',
				color: '#ddd',
				'&:hover': {
					color: '#ccc'
				}
			},
			'.filter': {
				pos: 'a',
				top: '62px',
				right: '15px',
				pad: '4px',
				bdrsa: '3px',
				wid: '120px',
				bg: '#383838',
				bd: 'solid 1px #555',
				ff: "'Roboto', 'sans-serif'",
				color: '#ddd'
			}
		}
	}
}