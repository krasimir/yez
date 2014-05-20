var Home = absurd.component('Home', {
	css: HomeCSS(),
	html: {
		'div[data-component="home"]': [
			{ h1: '<% tasks.length > 0 ? "Your tasks:" : "" %>' },
			{ 'input[class="filter" data-absurd-event="keyup:filter" autofocus]': ''},
			'<% for(var i=0; i<tasks.length; i++) { var started = tasks[i].started ? " started" : ""; var name = tasks[i].name; %>',
			{ 
				'div[class="task<% started %>"]': {
					'a[href="#" data-absurd-event="click:showTask:<% i %>" data-name="<% name %>"]': '<i class="fa <% tasks[i].started ? "fa-refresh" : "fa-stop" %>"></i> <% tasks[i].name %>',
					'a[href="#" data-absurd-event="click:showAndRunTask:<% i %>" class="action"]': '<i class="fa fa-refresh"></i> Run',
					'a[href="#" data-absurd-event="click:stopTask:<% i %>" class="action stop"]': '<i class="fa fa-stop"></i> Stop'
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
				this.tasks.push({ id: ts[i].getId(), name: ts[i].data.name, started: ts[i].started });
			}
		}
		this.populate();
		return this;
	},
	showTask: function(e, index) {
		index = parseInt(index);
		this.dispatch('show-task', this.tasks[index].id);
	},
	showAndRunTask: function(e, index) {
		e.preventDefault();
		index = parseInt(index);
		this.dispatch('show-and-run-task', this.tasks[index].id);
	},
	stopTask: function(e, index) {
		e.preventDefault();
		index = parseInt(index);
		this.dispatch('stop-task', this.tasks[index].id);
	},
	newTask: function(e) {
		e.preventDefault();
		this.dispatch('new-task')
	},
	moveUp: function(e, index) {
		e.preventDefault();
		index = parseInt(index);
		this.dispatch('move-up', this.tasks[index].id);
	},
	moveDown: function(e, index) {
		e.preventDefault();
		index = parseInt(index);
		this.dispatch('move-down', this.tasks[index].id);
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
	}
});
function HomeCSS() {
	return {
		'[data-component="home"]': {
			bxz: 'bb',
			pad: '14px',
			h1: {
				pad: 0,
				mar: '0 0 17px 0'
			},
			'.task': {
				pos: 'r',
				a: [
					button(),
					{
						d: 'b',
						mar: '0 0 6px 0'
					}
				],
				'a.action': {
					pos: 'a',
					top: 0,
					right: 0,
					bg: '#84DC6D',
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
					color: '#FFF',
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
			'.newtask': {
				d: 'b',
				mar: '10px 0 0 10px',
				color: '#000',
				'&:hover': {
					color: '#297317'
				}
			},
			'.filter': {
				pos: 'a',
				top: '62px',
				right: '15px',
				pad: '4px',
				bdrsa: '4px',
				wid: '120px',
				bd: 'solid 1px #C5C5C5',
				ff: "'Roboto', 'sans-serif'"
			}
		}
	}
}