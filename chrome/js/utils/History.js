var TerminalHistory = {
	storage: {},
	setup: function(f, id) {
		this.field = f;
		this.id = id;
		this.setIndexToTop();
	},
	off: function() {
		this.field = this.id = null;
		this.index = 0;
	},
	store: function() {
		if(!this.field || !this.id) return;
		if(!this.storage[this.id]) this.storage[this.id] = [];
		this.storage[this.id].push(this.field.value);
		this.setIndexToTop();
	},
	pull: function(direction) {
		if(!this.field || !this.id) return;
		var arr = this.storage[this.id] ? this.storage[this.id] : [], res;
		res = arr[this.index] ? arr[this.index] : false;
		if(direction == 'up') {
			this.index = this.validateIndex(this.index - 1);
		} else {
			this.index = this.validateIndex(this.index + 1);
		}
		return res;
	},
	validateIndex: function(current) {
		var max = this.storage[this.id] ? this.storage[this.id].length-1 : 0;
		if(current < 0) { 
			return 0; 
		} else if(current > max) {
			return max;
		} else {
			return current;
		}
	},
	setIndexToTop: function() {
		this.index = this.storage[this.id] ? this.storage[this.id].length-1 : 0;
	}
}