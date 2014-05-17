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
					wid: '100px',
					ta: 'c',
					bdtlrs: '0',
					bdblrs: '0',
					'&:hover': {
						bg: '#4EC730'
					}
				}
			}
		}
	},
	html: {
		'div[data-component="home"]': [
			{ h1: '<% tasks.length > 0 ? "Your tasks:" : "" %>' },
			'<% for(var i=0; i<tasks.length; i++) { %>',
			{ 
				'.task': {
					'a[href="#" data-absurd-event="click:showTask:<% i %>"]': '<i class="fa fa-arrow-circle-o-right"></i> <% tasks[i].name %>',
					'a[href="#" data-absurd-event="click:showAndRunTask:<% i %>" class="run"]': '<i class="fa fa-cogs"></i> Run'
				}
			},
			'<% } %>'
		]
	},
	tasks: [],
	setTasks: function(ts) {
		if(ts) {
			this.tasks = [];
			for(var i in ts) {
				this.tasks.push({ id: ts[i].id, name: ts[i].data.name });
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
	}
})