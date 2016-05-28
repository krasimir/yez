var Content = absurd.component('Content', {
	html: '[data-component="content"]',
	current: null,
	constructor: function() {
		this.populate().getGitStatus();
	},
	append: function(component) {
		if(!component.el) {
			component.populate();
		}
		this.el.innerHTML = '';
		this.el.appendChild(component.el);
		if(component.appended) {
			component.appended();
		}
		this.current = component;
	},
	visible: function(v) {
		this.el.style.display = v ? 'block' : 'none';
	},
	passKeypressSignal: function(signal) {
		if(this.current && this.current[signal]) {
			this.current[signal]();
		}
	},
	getGitStatus: function() {
		var self = this;
		if(this.current && this.current.data && this.current.data.cwd) {
			Yez.send({
				action: 'git-status',
				cwd: this.current.data.cwd
			}, function(data) {
				var text = '';
				if(typeof data.err == 'undefined' && data.data && data.data.length > 0) {
					var gitStatusResult = data.data.join('\n');
					var lines = gitStatusResult.split("\n");
					var branch = '';
					var status = {};
					for(var i=0; i<lines.length; i++) {
						var line = lines[i];
						if(i == 0) {
							branch = line.replace("## ", '');
						} else {
							var parts = line.split(" ");
							if(parts.length >= 2) {
								var type = parts.length == 2 ? parts[0] : parts[1];
								if(!status[type]) status[type] = 0;
								status[type] += 1;
							}
						}
					}
					self.current.gitStatus && self.current.gitStatus({
						branch: branch,
						status: status
					});
				}
			});
		}
		setTimeout(self.getGitStatus.bind(self), 1000);
	}
})