var Nav = absurd.component('Nav', {
	css: {
		'[data-component="nav"]': {
			fl: 'l',
			pad: '10px 0 0 10px',
			d: 'b',
			a: {
				d: 'ib',
				color: '#000',
				bdb: 'solid 1px #999',
				pad: '0 14px',
				bdrsa: '6px',
				bg: '#E2D8AF',
				'&:hover': {
					bg: '#EBDFC2'
				}
			}
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