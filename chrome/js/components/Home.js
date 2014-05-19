var Home = absurd.component('Home', {
	css: {
		'[data-component="home"]': {
			bxz: 'bb',
			pad: '20px',
			h1: {
				pad: 0,
				mar: '0 0 10px 0'
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
				'a.run': {
					pos: 'a',
					top: 0,
					right: 0,
					bg: '#84DC6D',
					bdb: 'n',
					bdl: 'solid 1px #999',
					wid: '60px',
					ta: 'c',
					bdtlrs: '0',
					bdblrs: '0',
					'&:hover': {
						bg: '#4EC730'
					}
				}
			},
			'.started': {
				'a.run': {
					d: 'n'
				}
			},
			'.newtask': {
				d: 'b',
				mar: '10px 0 0 10px',
				color: '#000',
				'&:hover': {
					color: '#297317'
				}
			}
		}
	},
	html: {
		'div[data-component="home"]': [
			{ h1: '<% tasks.length > 0 ? "Your tasks:" : "" %>' },
			'<% for(var i=0; i<tasks.length; i++) { var started = tasks[i].started ? " started" : ""; %>',
			{ 
				'div[class="task<% started %>"]': {
					'a[href="#" data-absurd-event="click:showTask:<% i %>"]': '<i class="fa <% tasks[i].started ? "fa-arrow-circle-o-right" : "fa-stop" %>"></i> <% tasks[i].name %>',
					'a[href="#" data-absurd-event="click:showAndRunTask:<% i %>" class="run"]': '<i class="fa fa-cogs"></i> Run'
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
		index = parseInt(index);
		this.dispatch('show-and-run-task', this.tasks[index].id);
	},
	newTask: function(e) {
		e.preventDefault();
		this.dispatch('new-task')
	}
})