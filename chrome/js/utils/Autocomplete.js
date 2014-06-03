var Autocomplete = {
	dictionary: {
		node: '', git: ''
	},
	matchingWord: '',
	setup: function(f, h) {
		this.field = f;
		this.hint = h;
		this.check();
	},
	off: function() {
		this.field = this.hint = null;
		this.matchingWord = this.path = '';
	},
	check: function(cwd) {
		if(!this.field || !this.hint) return;
		var value = '', matches = [];
		this.hint.innerHTML = matchingWord = this.path = this.all = '';
		if(this.field.value.match(/\//g)) {
			var vIntervals = this.field.value.split(/ /g);
			var lastVInterval = vIntervals.pop();
			var vSlash = lastVInterval.split(/\//g);
			value = vSlash.pop();
			this.path = vSlash.join('/') + '/';
			this.all = vIntervals.join(' ') + (vIntervals.length > 0 ? ' ' : '') + vSlash.join('/');
		} else {
			value = this.field.value;
		}
		if(value != '') {
			for(var word in this.dictionary) {
				var re = new RegExp("^" + value.toLowerCase().replace(/\./, '\\.') + "(.*)?");
				if(word.toLowerCase().match(re)) {
					matches.push(word);
				}
			}
			if(matches.length > 0) {		
				this.matchingWord = matches.shift();
				var hintStr = '';
				hintStr += (this.all != '' ? this.all + '/' : '') + this.matchingWord;
				if(matches.length > 0) {
					hintStr += ', ' + matches.join(', ');
				}
				this.hint.innerHTML = hintStr;
			}
			if(cwd && typeof cwd == 'string') {
				this.checkFileSystemDictionary(cwd + '/' + this.path);
			}
		}
	},
	applyMatch: function() {
		if(this.matchingWord != '' && this.field) {
			this.field.value = (this.all != '' ? this.all + '/' : '') + this.matchingWord;
		}
	},
	checkFileSystemDictionary: function(cwd) {
		var self = this;
		Yez.send({
			action: 'list',
			cwd: cwd,
			files: true
		}, function(data) {
			if(data.err) {
				if(typeof data.err == 'object') data.err = JSON.stringify(data.err);
				// alert(data.err);
			} else {
				for(var i=0; i<data.files.length; i++) {
					self.dictionary[data.files[i]] = '';
				}
				self.check();
			}
		});
	},
	clear: function() {
		if(this.field && this.hint) {
			this.hint.innerHTML = '';
		}
	}
}