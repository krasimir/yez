var Nav = absurd.component('Nav', {
	css: {
		'[data-component="nav"]': {
			fl: 'l',
			pad: '6px 0 0 10px',
			d: 'n',
			a: [
				button(),
				{ bxz: 'bb', wid: '40px', hei: '35px', ov: 'h', ta: 'c' }
			]
		}
	},
	html: '[data-component="nav"]',
	tabs: [],
	constructor: function() {
		this.populate();
	},
	visible: function(s) {
		this.css['[data-component="nav"]'].d = s ? 'b' : 'n';
		this.populate();
	},
	newtab: function(e) {
		e.preventDefault();
		this.dispatch('new');
	}
})