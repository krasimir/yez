var Home = absurd.component('Home', {
	css: {
		'[data-component="home"]': {
			bxz: 'bb',
			pad: '20px',
			h1: {
				pad: 0,
				mar: '0 0 10px 0'
			},
			a: [
				button(),
				{
					d: 'b',
					mar: '0 0 6px 0'
				}
			]
		}
	},
	html: {
		'div[data-component="home"]': [
			{ h1: '<% tasks.length > 0 ? "Your tasks:" : "" %>' },
			'<% for(var i=0; i<tasks.length; i++) { %>',
			{ 'a[href="#" data-absurd-event="click:showTask:<% i %>"]': '<i class="fa fa-arrow-circle-o-right"></i> <% tasks[i].name %>' },
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
	}
})