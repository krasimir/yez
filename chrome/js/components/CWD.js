var CWD = absurd.component('CWD', {
	css: {
		'.cwd': {
			wid: '100%',
			hei: '100%',
			pos: 'a', top: 0, left: 0,
			bg: 'rgba(0, 0, 0, 0.5)',
			'.content': {
				pos: 'a', left: '2%', top: '2%',
				wid: '94%', hei: '94%',
				pad: '10px',
				bg: '#F0F0F0',
				bxz: 'bb',
				'.info': {
					bxz: 'bb',
					hei: '60px',
					fz: '12px',
					lh: '16px'
				},
				'.inner': {
					ovx: 'h', ovy: 's',
					hei: 'calc(100% - 120px)',
					bxz: 'bb',
					a: {
						d: 'b',
						color: '#000',
						ted: 'n',
						pad: '0 0 0 4px',
						bg: '#D4D4D4',
						bdrsa: '4px',
						fz: '12px',
						mar: '0 0 2px 0',
						bxz: 'bb',
						'&:hover': {
							bg: '#C0C0C0'
						}
					}
				},
				'.actions': {
					mar: '20px 0 0 0',
					a: [
						button()
					]
				}
			}
		}
	},
	html: {
		'.cwd': {
			'.content': {
				'.info': '<i class="fa fa-arrow-circle-o-right"></i> <% cwd %>',
				'.inner': [
					'<% for(var i=0; i<links.length; i++) { %>',
					{ 'a[href="#" data-absurd-event="click:change:<% i %>"]': '<i class="fa fa-angle-right"></i> <% links[i] %>'},
					'<% } %>'
				],
				'.actions': [
					{ 'a[href="#" data-absurd-event="click:result:ok"]': '<i class="fa fa-check-circle-o"></i> OK'},
					{ 'a[href="#" data-absurd-event="click:result:cancel"]': '<i class="fa  fa-times-circle-o"></i> Cancel'}
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
			var pathParts = normalizePath(this.cwd).split('/');
			pathParts.pop();
			var path = pathParts.join('/');
			if(path.charAt(path.length-1) == ':') path = path + '/';
			this.list(path);
		} else {
			this.list(this.cwd + '/' + this.links[index]);
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