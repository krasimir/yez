var Status = absurd.component('Status', {
	css: {
		'[data-component="status"]': {
			pad: '12px 14px 0 0',
			fz: '14px',
			fl: 'r',
			color: '#9F9F9F',
			'.fa-flash-connected': {
				color: '#26A430'
			},
			'.fa-flash-disconnected': {
				color: '#CC151A'
			}
		}
	},
	html: '[data-component="status"]',
	status: 'disconnected',
	constructor: function() {
		this.populate();
	},
	setStatus: function(s) {
		this.status = s ? 'connected' : 'disconnected';
		this.populate();
	}
})