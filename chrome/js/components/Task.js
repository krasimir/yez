var TaskCSSBreadcrumbs = function() {
	return {
		bxz: 'bb',
		pad: '6px 14px',
		bg: '#F9F7F2',
		bdb: 'solid 1px #E7E7E7',
		bdt: 'solid 1px #fff',
		color: '#575757',
		fz: '14px',
		a: {
			color: '#999',
			fz: '14px',
			ted: 'underline',
			'&:hover': {
				color: '#000'
			}
		}
	};
}
var TaskCSSEdit = function() {
	return {
		bxz: 'bb',
		pad: '10px',
		display: '<% mode == "edit" ? "block" : "none" %>',
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
			'.sub-left': {
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
			'.sub-right': {
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
	};
}
var TaskCSSDashboard = function() {
	return {
		display: '<% mode == "dashboard" ? "block" : "none" %>',
		bxz: 'bb',
		pad: '10px',
		h1: {
			mar: '20px 0 20px 0',
			pad: 0,
			fz: '30px'
		},
		'.operation': button(),
		'.log': {
			bxz: 'bb',
			pos: 'a',
			pad: '10px',
			top: '144px',
			left: '10px',
			bg: '#FAFAFA',
			wid: 'calc(100% - 18px)',
			hei: 'calc(100% - 152px)',
			fz: '12px',
			lh: '20px',
			bdrsa: '4px',
			ovx: 'h',
			ovy: 's',
			p: {
				pad: '0 4px',
				mar: '0 0 4px 0',
				bdrsa: '2px'
			},
			'.log-command': {
				bg: '#C0DFE7',
				bdb: 'solid 1px #E1E1E1',
				ta: 'r'
			},
			'.log-error': {
				bg: '#F39C9C',
				bdb: 'solid 1px #E1E1E1'
			},
			'.log-end': {
				bg: '#E4CEC2',
				bdb: 'solid 1px #E1E1E1'
			},
			'.log-response': {
				lh: '16px'
			},
			'.log-task-end': {
				bg: '#87E789',
				bdb: 'solid 1px #E1E1E1'
			},
			'.log-info': {
				bg: '#C6E7E8',
				color: '#2E7072',
				bdb: 'solid 1px #66BFC1',
				bdrsa: '4px'
			}
		},
		'.hidden': { d: 'n' },
		'.clear-log': {
			color: '#999',
			fz: '12px',
			pos: 'a',
			top: '104px',
			right: '12px',
			ted: 'n',
			'&:hover': {
				color: '#000'
			}
		}
	}
}
var Task = absurd.component('Task', {
	css: {
		'.task-<% getId() %>': {
			'.breadcrumbs': TaskCSSBreadcrumbs(),
			'.edit': TaskCSSEdit(),
			'.dashboard': TaskCSSDashboard() 
		}
	},
	html: {
		'div[class="task-<% getId() %>"]': {
			'.breadcrumbs': [
				'<i class="fa fa-angle-right"></i>',
				{ 'a[href="#" data-absurd-event="click:gotoHome"]': '&nbsp;Home'},
				' / <% data.name %>'
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
						},
						'a.sub-right[href="#" data-absurd-event="click:chooseCWD:<% i %>"]': '<i class="fa fa-folder-open"></i>'
					}
				},
				'<% for(var i=0; i<data.commands.length; i++) { var c = data.commands[i]; %>',
				{
					'.element': {
						label: '<i class="fa fa-wrench"></i> <% i+1 %>',
						'.field': {
							'input[type="text" value="<% c %>" data-absurd-event="keyup:changeCommand:<% i %>"]': ''
						},
						'a.sub-left[href="#" data-absurd-event="click:addCommand:<% i %>"]': '<i class="fa fa-plus-circle"></i>',
						'a.sub-right[href="#" data-absurd-event="click:removeCommand:<% i %>"]': '<i class="fa fa-minus-circle"></i>'
					}
				},
				'<% } %>',
				{
					'.actions': [
						{ 'a[href="#" data-absurd-event="click:saveCommand"]': '<i class="fa fa-check-circle-o"></i> Save' }
					]
				}
			],
			'.dashboard': [
				{ 'a[href="#" class="operation<% started ? " hidden" : "" %>" data-absurd-event="click:startTasks"]': '<i class="fa fa-refresh"></i> Start'},
				{ 'a[href="#" class="operation<% started ? "" : " hidden" %>" data-absurd-event="click:stopTasks"]': '<i class="fa fa-stop"></i> Stop'},
				{ 'a[href="#" class="operation" data-absurd-event="click:goToEditMode"]': '<i class="fa fa-edit"></i> Edit'},
				{ 'a[href="#" class="operation" data-absurd-event="click:deleteTask"]': '<i class="fa fa-times-circle-o"></i> Delete'},
				{ 'a[href="#" class="clear-log" data-absurd-event="click:clearLog"]': '<i class="fa fa-eraser"></i> Clear'},
				{ '.log': '<% logContent %>' }
			]
		}
	},
	mode: 'dashboard',
	started: false,
	logContent: '',
	data: {
		id: '',
		name: 'Task',
		cwd: '',
		commands: ['']
	},
	constructor: function(data) {
		this.data = data;
		this.setMode(data ? 'dashboard' : 'edit');
	},
	getId: function() {
		return this.data.id;
	},
	setMode: function(m) {
		this.mode = m;
		this.populate();
	},
	gotoHome: function(e) {
		e.preventDefault();
		this.dispatch('home');
	},
	// *********************************************** edit mode
	addCommand: function(e, index) {
		index = parseInt(index);
		this.data.commands.splice(index+1, 0, '');
		this.populate();
	},
	removeCommand: function(e, index) {
		index = parseInt(index);
		if(this.data.commands.length === 1) return;
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
		this.dispatch('save');
	},
	// *********************************************** dashboard mode
	goToEditMode: function(e, dom) {
		e && e.preventDefault();
		this.setMode('edit');
		dom('input[name="name"]').el.focus();
	},
	startTasks: function(e) {
		e && e.preventDefault();
		if(this.started) return;
		this.started = true;
		this.commandsToProcess = this.data.commands.slice(0);
		this.populate();
		this.processTask();
		this.dispatch('save');
	},
	processTask: function() {
		if(!this.commandsToProcess || this.commandsToProcess.length == 0) {
			this.started = false;
			this.populate();
			this.log('<p class="log-task-end">' + this.data.commands.length + ' command' + (this.data.commands.length > 1 ? 's' : '') + ' finished</p>');
			this.dispatch('save');
			return;
		}
		var command = this.commandsToProcess.shift();
		this.log('<p class="log-command">' + command + ' <i class="fa fa-angle-left"></i></p>');
		this.dispatch('data', {
			id: this.data.id,
			action: 'run-command',
			command: command,
			cwd: this.data.cwd
		});
	},
	response: function(data) {
		switch(data.action) {
			case 'err':
				this.log('<p class="log-error">' + data.msg + '</p>');
			break;
			case 'data':
				this.log('<p class="log-response">' + data.data + '</p>');
			break;
			case 'end':
				if(data.err != false) {
					for(var i=0; i<data.err.length; i++) {
						var err = data.err[i], errDesc;
						errDesc = err.code == 'ENOENT' ? 'Wrong file, directory or command name.<br />Error: ' : '';						
						if(typeof err == 'object') err = JSON.stringify(err);
						this.log('<p class="log-error">' + errDesc + err + '</p>');
					}
				}
				this.log('<p class="log-end">end (code: ' + data.code + ')</p>');
				this.processTask(data);
			break;
		}
	},
	stopTasks: function(e) {
		e && e.preventDefault();
		this.dispatch('stop', {
			id: this.data.id,
			action: 'stop-command'
		});
	},
	deleteTask: function(e) {
		if(confirm('Are you sure?')) {
			this.dispatch('delete-task');
		}
	},
	log: function(msg, dom) {
		var html = ansi_up.ansi_to_html(msg);
		html = html.replace(/\n/g, '<br />');
		if(!this.logElement) { this.logElement = dom('.dashboard .log').el; }
		if(this.logElement) {
			this.logElement.innerHTML = this.logElement.innerHTML + html;
			this.logElement.scrollTop = this.logElement.scrollHeight;	
		}
		this.logContent = this.logElement.innerHTML;
	},
	clearLog: function() {
		this.logContent = '';
		this.populate();
	},
	// choosing cwd
	chooseCWD: function(e) {
		e.preventDefault();
		CWD(this.data.cwd, function(cwd) {
			if(cwd) {
				this.data.cwd = cwd;
				this.populate();
			}
		}.bind(this));
	}
});