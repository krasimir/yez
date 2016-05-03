var CWD = absurd.component('CWD', {
	html: {
		'.dialog': {
			'.content': {
				'.info': '<i class="fa fa-arrow-circle-o-right"></i> <% cwd %>',
				'.inner': [
					'<% for(var i=0; i<links.length; i++) { %>',
					{ 'a[href="#" data-absurd-event="click:change:<% i %>"]': '<i class="fa fa-angle-right"></i> <% links[i] %>'},
					'<% } %>'
				],
				'.actions': [
					{ 'a[href="#" class="button" data-absurd-event="click:result:ok"]': '<i class="fa fa-check-circle-o"></i> OK'},
					{ 'a[href="#" class="button" data-absurd-event="click:result:cancel"]': '<i class="fa  fa-times-circle-o"></i> Cancel'}
				]
			}
		}
	},
	links: [],
	cwd: '',
	list: function(cwd) {
		this.cwd = cwd;
		Yez.send({
			action: 'list',
			cwd: cwd
		}, function(data) {
			if(data.err) {
				if(typeof data.err == 'object') data.err = JSON.stringify(data.err);
				// alert(data.err);
			} else {
				this.links = ['..'].concat(data.files);
				this.populate();
			}
		}.bind(this));
	},
	change: function(e, index) {
		e && e.preventDefault();
		index = parseInt(index);
		if(index == 0) {
			var pathParts = normalizePath(this.cwd).split(Yez.sep);
			pathParts.pop();
			var path = pathParts.join(Yez.sep);
			if(path.charAt(path.length-1) == ':') path = path + Yez.sep;
			this.list(path);
		} else {
			this.list(this.cwd + Yez.sep + this.links[index]);
		}
	},
	result: function(e, res) {
		e.preventDefault();
		this.callback ? this.callback(res === 'ok' ? this.cwd : false) : null;
		document.querySelector('body').removeChild(this.populate().el);
	},
	constructor: function(cwd, cb, dom) {
		this.cwd = cwd;
		this.callback = cb;
		this.populate();
		document.querySelector('body').appendChild(this.populate().el)
		this.list(cwd);
	}
});