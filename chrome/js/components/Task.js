var Task = absurd.component('Task', {
	html: TaskTemplate(),
	mode: 'dashboard',
	started: false,
	logContent: '',
	data: {
		id: '',
		name: 'Task',
		cwd: '',
		commands: [''],
		independent: [],
		autorun: false
	},
	constructor: function(data) {
		this.data = data;
		if(data.terminal) this.terminalInit();
		this
		.setMode(data ? 'dashboard' : 'edit')
		.gitStatus();
	},
	getId: function() {
		return this.data && this.data.id && this.data.id != '' ? this.data.id : getId();
	},
	setMode: function(m) {
		this.mode = m;
		this.populate();
		if (!this.el) this.el = this.qs('.task-'+this.getId());
		if (m == 'edit') this.addClass(m, this.el);
		else this.removeClass(m, this.el);
		return this;
	},
	gotoHome: function(e) {
		e.preventDefault();
		this.dispatch('home');
		return this;
	},
	appended: function() {
		var self = this;
		if(this.mode == 'dashboard') {
			setTimeout(function() {
				self.qs('.stdin-field').focus();
			}, 200);	
		}
	},
	// *********************************************** edit mode
	goToEditMode: function(e, dom) {
		e && e.preventDefault();
		this.setMode('edit');
		this.qs('input[name="name"]').focus();
	},
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
	independentCommand: function(e, index) {
		index = parseInt(index);
		if(!this.data.independent) {
			this.data.independent = [];
			this.data.independent.push(index);
		} else {
			var i = this.data.independent.indexOf(index);
			if(i >= 0) {
				this.data.independent.splice(i, 1);
			} else {
				this.data.independent.push(index);
			}
		}
		this.populate();
	},
	changeCommand: function(e, index) {
		index = parseInt(index);
		this.data.commands[index] = e.target.value.replace(/"/g, '&quot;');
		e.target.setAttribute('value', e.target.value);
	},
	changeCommandName: function(e) {
		this.data.name = e.target.value;
	},
	changeCWD: function(e) {
		this.data.cwd = e.target.value;
	},
	autorunClick: function(e) { console.log(e.target.checked);
		this.data.autorun = e.target.checked;
	},
	saveCommand: function(e) {
		e.preventDefault();
		this.setMode('dashboard');
		this.dispatch('save');
	},
	deleteTask: function(e) {
		if(confirm('Are you sure?')) {
			this.dispatch('delete-task');
		}
	},
	chooseCWD: function(e) {
		e.preventDefault();
		CWD(this.data.cwd, function(cwd) {
			if(cwd) {
				this.data.cwd = cwd;
				this.populate();
			}
		}.bind(this));
	},
	openCwd: function (e) {
	    this.chooseCWD(e);	
	},
	// *********************************************** dashboard mode
	startTasks: function(e) {
		e && e.preventDefault();
		if(this.started) return;
		this.setMode('dashboard');
		this.started = true;
		this.endedCommands = 0;
		this.commandsToProcess = this.data.commands.slice(0);
		this.populate();
		this.processTask();
		this.dispatch('save');
		this.endedCommands = 0;
	},
	stopTasks: function(e) {
		e && e.preventDefault();
		this.setMode('dashboard');
		this.dispatch('data', {
			id: this.data.id,
			action: 'stop-command'
		});
		this.commandsToProcess = [];
		this.endedCommands = -2;
		this.log('<p class="log-command"><i class="fa fa-angle-right"></i> stopping ...</p>');
	},
	restartTasks: function(e) {
		e && e.preventDefault();
		this.restart = true;
		this.stopTasks(e);
	},
	// Loop that sends the commands
	processTask: function() {
		if(!this.commandsToProcess || this.commandsToProcess.length == 0) {
			if(this.endedCommands >= this.data.commands.length || this.endedCommands == -1) {
				this.started = false;
				this.populate();
				this.log('<p class="log-task-end">task finished</p>');
				this.dispatch('save');
				this.dispatch('ended');
				if(this.restart) {
					this.restart = false;
					this.clearLog().startTasks();
				}
			}
			return;
		}
		var index = this.data.commands.length - this.commandsToProcess.length;
		var command = this.commandsToProcess.shift();
		// ********************************************************* chrome
		if(command.indexOf('chrome:') === 0) {
			var parts = command.split(':'), self = this;
			parts.shift();
			chrome.runtime.sendMessage({
				type: parts.shift(),
				data: parts.join(':')
			}, function(res) {
				if(res) {
					self.response({ action: 'data', data: typeof res == 'object' ? JSON.stringify(res): res });
				}
				self.response({ action: 'end', err: false, code: 'none'});
			});
			this.log('<p class="log-command"><i class="fa fa-angle-right"></i> ' + command + '</p>');

		// ********************************************************* nodejs
		} else {
			this.log('<p class="log-command"><i class="fa fa-angle-right"></i> ' + command + '</p>');
			this.dispatch('data', {
				id: this.data.id,
				action: 'run-command',
				command: command.replace(/&quot;/g, '"'),
				cwd: this.data.cwd
			});
		}
		// check if it is locked to the chain
		if(this.data.independent && this.data.independent.indexOf(index) >= 0) {
			this.processTask();
		}
	},
	// process the response from the Node.js part
	response: function(data) {
		var filterResponse = function(str) {
			str = str.replace(/</g, '&lt;');
			str = str.replace(/>/g, '&gt;');
			return str;
		}
		switch(data.action) {
			case 'err':
				if(data.msg.toLowerCase().indexOf('warning') === 0) {
					this.log('<p class="log-warning">' + filterResponse(data.msg) + '</p>');	
				} else {
					this.log('<p class="log-error">' + filterResponse(data.msg) + '</p>');	
				}				
			break;
			case 'data':
				this.log('<p class="log-response">' + filterResponse(data.data) + '</p>');
			break;
			case 'end':
				var allErrors = '';
				if(data.err != false) {
					allErrors += '<br />';
					for(var i=0; i<data.err.length; i++) {
						var err = data.err[i], errDesc;
						errDesc = err.code == 'ENOENT' ? 'Something went wrong!<br />Error: ' : '';						
						if(typeof err == 'object') err = JSON.stringify(err);
						allErrors += errDesc + err + '<br />';
					}
					allErrors = '';
				}
				this.log('<p class="log-end">end (code: ' + data.code + ')' + filterResponse(allErrors) + '</p>');
				this.endedCommands += 1;
				this.processTask();
			break;
			case 'exit':
				this.log('<p class="log-end">exit (code: ' + data.code + ', signal: ' + data.signal + ')</p>');
			break;
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
		return this;
	},
	stdinKeyUp: function(e) {
		var historyValue = '';
		e && e.preventDefault();
		e && e.stopPropagation();
		if(e.keyCode === 13) { // enter
			Autocomplete.clear();
			var input = e.target.value, self = this;
			TerminalHistory.store(input);
			input = this.applyAliases(input);
			this.log('<p class="log-stdin"><i class="fa fa-keyboard-o"></i> ' + input + '</p>');
			e.target.value = '';
			if(input.indexOf(' && ') >= 0) {
				this.commandsToProcess = input.split(' && ');
				this.processTask();
				return;
			}
			if(input.split(/ /g)[0].toLowerCase() == 'cd') {
				var pathToAppend = input.split(/ /g),
				    loc,
				    appendOnlyIf = [Yez.sep];
				pathToAppend.shift();
				loc = pathToAppend.join(' ');
				Yez.send({
					action: 'cd',
					id: this.getId(),
					dir: appendOnlyIf.indexOf(loc.charAt(0)) >= 0 ? loc : this.data.cwd + Yez.sep + loc
				}, function(data) {
					if(data.err) {
						self.log('<p class="log-error"><i class="fa fa-keyboard-o"></i> ' + data.err.msg + '</p>');
					} else if(data.dir) {
						self.data.cwd = normalizePath(data.dir);
						self.populate();
					}
				});
			} else if (input.toLowerCase() == 'dir') {
				var cwd = this.data.cwd;
				Yez.send({
					action: 'list',
					id: this.getId(),
					cwd: cwd,
				}, function(data) {
					if(data.err) {
						self.log('<p class="log-error"><i class="fa fa-keyboard-o"></i> ' + data.err.msg + '</p>');
					} else {						
						var folders = data.files.join('</p><p class="log-response">');
						self.log('<p class="log-response">'+cwd+'</p><p class="log-response">'+folders+'</p>');
					}
				});
			} else {
				Yez.send({
					// action: this.data.terminal ? 'terminal' : 'stdin-input',
					action: 'run-command',
					id: this.getId(),
					command: input,
					cwd: this.data.cwd
				}, function(data) {
					// no need to process the result
				}.bind(this));
			}
		} else if(e.keyCode === 27) { // escape
			e.target.value = '';
		} else if(e.keyCode === 38) { // up
			if(historyValue = TerminalHistory.pull('up')) {
				e.target.value = historyValue;
			}
		} else if(e.keyCode === 40) { // down
			if(historyValue = TerminalHistory.pull('down')) {
				e.target.value = historyValue;
			}
		} else {
			Autocomplete.check(this.data.cwd);
		}
	},
	stdinKeyDown: function(e) {
		if(e.keyCode === 9) {
			e.preventDefault();
			Autocomplete.applyMatch();
		}
	},
	stdinFocused: function(e) {
		Autocomplete.setup(this.qs('.stdin-field'), this.qs('.autocomplete'));
		TerminalHistory.setup(this.qs('.stdin-field'), this.getId());
	},
	stdinBlured: function(e) {
		Autocomplete.off();
		TerminalHistory.off();
	},
	// *********************************************** terminal
	terminalInit: function() {
		this.html['div[class="task-id task-<% getId() %>"]']['.sub-nav'] = [
			{ 'a[href="#" class="button operation" data-absurd-event="click:stopTasks"]': '<i class="fa fa-stop"></i> Stop all processes'},
			{ 'a[href="#" class="button operation" data-absurd-event="click:deleteTask"]': '<i class="fa fa-times-circle-o"></i> Close'}
		];	
	},
	gitStatus: function(value) {
		if(!this.gitStatusHolder) {
			this.gitStatusHolder = this.qs('.git-status');
		}
		if(!value) {
			this.gitStatusHolder.innerHTML = '';
		} else {
			var str = '', changes = '';
			for(var i in value.status) {
				changes += i + value.status[i] + ' ';
			}
			str += '<span class="' + (changes != '' ? 'git-changed' : 'git-unchanged') + '"><i class="fa fa-git"></i> ' + value.branch;
			str += changes != '' ? '/' + changes : '</span>';
			this.gitStatusHolder.innerHTML = str;
		}
		return this;
	},
	editAliases: function() {
		Editor(Yez.aliases.bind(Yez), Yez.aliases(), 'Edit your aliases. Type one per line in the format "[regex]:[replacement]".');
	},
	applyAliases: function(input) {
		var aliases = Yez.aliases().split(/\n/g);
		for(var i=0; i<aliases.length; i++) {
			var a = aliases[i].split(':');
			var shortcut = a[0];
			var replacement = a[1] ? a[1] : a[0];
			var r = new RegExp(shortcut, "gi");
			input = input.replace(r, replacement);
		}
		return input;
	},
	// *********************************************** keypress signals
	'ctrl+l': function() {
		this.clearLog();
	},
	'ctrl+enter': function() {
		this.restartTasks();
	},
	'ctrl+i': function() {
		this.qs('.stdin-field').focus();
	},
	'ctrl+c': function() {
		if(this.qs('.stdin-field') === document.activeElement) {
			this.stopTasks();
		}
	}
});
function TaskTemplate() {
	return {
		'div[class="task-id task-<% getId() %>"]': {
			'.sub-nav': [
				{ 'a[href="#" class="button operation<% started ? " hidden" : "" %>" data-absurd-event="click:startTasks"]': '<i class="fa fa-refresh"></i> Start'},
				{ 'a[href="#" class="button operation<% started ? "" : " hidden" %>" data-absurd-event="click:restartTasks"]': '<i class="fa fa-repeat"></i> Restart'},
				{ 'a[href="#" class="button operation<% started ? "" : " hidden" %>" data-absurd-event="click:stopTasks"]': '<i class="fa fa-stop"></i> Stop'},
				{ 'a[href="#" class="button operation" data-absurd-event="click:goToEditMode"]': '<i class="fa fa-edit"></i> Edit'},
				{ 'a[href="#" class="button operation" data-absurd-event="click:deleteTask"]': '<i class="fa fa-times-circle-o"></i> Delete'}
			],
			'.edit': [
				{
					'.element': {
						'label': 'Name',
						'.field': {
							'input[type="text" name="name" value="<% data.name %>" data-absurd-event="keyup:changeCommandName"]': ''
						}
					}
				},
				{
					'.element': {
						'label': 'Working directory',
						'.field': {
							'input[type="text" name="cwd" value="<% data.cwd %>" data-absurd-event="change:changeCWD"]': ''
						},
						'a.sub-right[href="#" data-absurd-event="click:chooseCWD:<% i %>"]': '<i class="fa fa-folder-open"></i>'
					}
				},
				'<% for(var i=0; i<data.commands.length; i++) { \
					var c = data.commands[i]; \
					var indIcon = data.independent && data.independent.indexOf(i) >= 0 ? "fa-unlock" : "fa-lock"; \
					var tip = indIcon == "fa-lock" ? "Run it independently" : "Lock the command to the chain"; \
				%>',
				{
					'.element': {
						'label': '<i class="fa fa-wrench"></i> <% i+1 %>',
						'.field': {
							'input[type="text" value="<% c %>" data-absurd-event="keyup:changeCommand:<% i %>"]': ''
						},
						'a.sub-left[href="#" title="Add new command" data-absurd-event="click:addCommand:<% i %>"]': '<i class="fa fa-plus-circle"></i>',
						'a.sub-right[href="#" title="Remove the command" data-absurd-event="click:removeCommand:<% i %>"]': '<i class="fa fa-minus-circle"></i>',
						'a.sub-independent[href="#" title="<% tip %>" data-absurd-event="click:independentCommand:<% i %>"]': '<i class="fa <% indIcon %>"></i>'
					}
				},
				'<% } %>',
				{
					'.element.autorun': [
						{ 'span': 'Autorun<input type="checkbox" <% data.autorun ? "checked" : "" %> name="autorun" data-absurd-event="click:autorunClick">' }
					]
				},
				{
					'.actions': [
						{ 'a[href="#" class="button operation" data-absurd-event="click:saveCommand"]': '<i class="fa fa-check-circle-o"></i> Save' }
					]
				}				
			],
			'.dashboard': [
				{ 'a[href="#" class="clear-log" data-absurd-event="click:clearLog"]': '<i class="fa fa-eraser"></i> Clear'},
				{ '.log': '<% logContent %>' },
				{ '.autocomplete': ''},
				{ 'input[class="stdin-field" data-absurd-event="keyup:stdinKeyUp,keydown:stdinKeyDown,focus:stdinFocused,blur:stdinBlured"]': ''},
				{ '.stdin-field-tooltip': '<i class="fa fa-angle-right"></i>'},
				{ '.task-cwd[data-absurd-event="click:openCwd"]': '<i class="fa fa-dot-circle-o"></i> <% data.cwd %>' },
				{ '.git-status': '' },
				{ 'a[href="#" class="aliases" data-absurd-event="click:editAliases"]': '<i class="fa fa-heart"></i>'}
			]
		}
	}
}
