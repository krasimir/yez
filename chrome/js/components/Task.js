var Task = absurd.component('Task', {
	css: {
		'.task': {
			'.breadcrumbs': {
				bxz: 'bb',
				pad: '6px 14px',
				bg: '#F9F7F2',
				bdb: 'solid 1px #E7E7E7',
				bdt: 'solid 1px #fff',
				color: '#999',
				fz: '14px',
				a: {
					color: '#999',
					fz: '14px',
					ted: 'underline',
					'&:hover': {
						color: '#000'
					}
				}
			},
			'.edit': {
				bxz: 'bb',
				pad: '10px',
				d: 'b',
				'.element': {
					pos: 'r',
					wid: '100%',
					bxz: 'bb',
					mar: '6px 0 6px 0',
					label: {
						wid: '30%',
						pad: '0 20px 0 0',
						bxz: 'bb',
						bg: '#EDE9E0',
						fl: 'l',
						pad: '10px',
						bdtlrs: '10px',
						bdblrs: '10px',
						ta: 'r',
						bdr: 'solid 2px #DECAB6',
						bdb: 'solid 1px #999',
						hei: '47px',
						ov: 'h'
					},
					'.field': {
						wid: '70%',
						fl: 'l',
						bxz: 'bb',
						bg: '#F8F5EF',
						bdtrrs: '10px',
						bdbrrs: '10px',
						bdb: 'solid 1px #999',
						input: {
							hei: '46px',
							bd: 'n',
							bg: 'n',
							bxz: 'bb',
							wid: '100%',
							pad: '10px'
						}
					},
					'&:after': {
						content: '" "',
						d: 'tb',
						clear: 'both'
					},
					'.add': {
						color: '#000',
						d: 'b',
						pos: 'a',
						top: '10px',
						left: '10px',
						pad: '0 10px',
						bg: '#F5F3EF',
						bdrsa: '4px',
						'&:hover': { bg: '#D5CCBB' }
					},
					'.remove': {
						color: '#000',
						d: 'b',
						pos: 'a',
						top: '10px',
						right: '10px',
						pad: '0 10px',
						bg: '#FBFAF7',
						bdrsa: '4px',
						'&:hover': { bg: '#E6DBC4' }
					}
				},
				'.actions': {
					clear: 'both',
					mar: '0 0 0 30%',
					pad: '6px 0 0 0',
					a: button(),
					'.cancel': buttonTransparent()
				}
			},
			'.dashboard': {
				bxz: 'bb',
				pad: '10px',
				h1: {
					mar: '20px 0 20px 0',
					pad: 0,
					fz: '30px'
				},
				'.operation': button(),
				'.stop': buttonTransparent()
			}
		}
	},
	html: {
		'.task': {
			'.breadcrumbs': [
				{ 'a[href="#"]': 'Home'},
				' / <% data.name %> / <% mode %>'
			],
			'.edit': [
				{
					'.element': {
						label: 'Name',
						'.field': {
							'input[type="text" name="name" value="<% data.name %>" data-absurd-event="keyup:changeCommandName"]': ''
						}
					}
				},
				{
					'.element': {
						label: 'Working directory',
						'.field': {
							'input[type="text" name="cwd" value="<% data.cwd %>" data-absurd-event="change:changeCWD"]': ''
						}
					}
				},
				'<% for(var i=0; i<data.commands.length; i++) { var c = data.commands[i]; %>',
				{
					'.element': {
						label: '<i class="fa fa-wrench"></i> <% i+1 %>',
						'.field': {
							'input[type="text" value="<% c %>" data-absurd-event="keyup:changeCommand:<% i %>"]': ''
						},
						'a.add[href="#" data-absurd-event="click:addCommand:<% i %>"]': '<i class="fa fa-plus-circle"></i>',
						'a.remove[href="#" data-absurd-event="click:removeCommand:<% i %>"]': '<i class="fa fa-minus-circle"></i>'
					}
				},
				'<% } %>',
				{
					'.actions': [
						{ 'a[href="#" data-absurd-event="click:saveCommand"]': '<i class="fa fa-check-circle-o"></i> Save' },
						{ 'a[href="#" class="cancel"]': '<i class="fa fa-times-circle-o"></i> Cancel' },
					]
				}
			],
			'.dashboard': [
				{ 'a[href="#" class="operation" data-absurd-event="click:goToEditMode"]': '<i class="fa fa-edit"></i> Edit'},
				{ 'a[href="#" class="operation" data-absurd-event="click:startTasks"]': '<i class="fa fa-refresh"></i> Start'},
				{ 'a[href="#" class="operation stop" data-absurd-event="click:stopTasks"]': '<i class="fa fa-stop"></i> Stop'}
			]
		}
	},
	data: {
		name: 'Task',
		cwd: '',
		commands: ['']
	},
	constructor: function(data) {
		this.data = data || this.data;
		this.setMode(data ? 'dashboard' : 'edit');
	},
	setMode: function(m) {
		this.mode = m;
		if(this.mode === 'edit') {
			this.css['.task']['.edit'].d = 'b';
			this.css['.task']['.dashboard'].d = 'n';
		} else if(this.mode === 'dashboard') {
			this.css['.task']['.edit'].d = 'n';
			this.css['.task']['.dashboard'].d = 'b';
		}
		return this.populate();
	},
	// edit mode
	addCommand: function(e, index) {
		index = parseInt(index);
		this.data.commands.splice(index+1, 0, '');
		this.populate();
	},
	removeCommand: function(e, index) {
		index = parseInt(index);
		if(index === 0) return;
		this.data.commands.splice(index, 1);
		this.populate();
	},
	changeCommand: function(e, index) {
		index = parseInt(index);
		this.data.commands[index] = e.target.value;
		e.target.setAttribute('value', e.target.value)
	},
	changeCommandName: function(e) {
		this.data.name = e.target.value;
	},
	changeCWD: function(e) {
		this.data.cwd = e.target.value;
	},
	saveCommand: function(e) {
		e.preventDefault();
		this.setMode('dashboard');
	},
	// dashboard mode
	goToEditMode: function(e) {
		e.preventDefault();
		this.setMode('edit');
	},
	startTasks: function(e) {
		e.preventDefault();
	},
	stopTasks: function(e) {
		e.preventDefault();
	}

})