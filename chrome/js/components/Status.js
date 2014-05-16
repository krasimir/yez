var Status = absurd.component('Status', {
	css: {
		'[data-component="status"]': {
			pos: 'r',
			pad: '12px 14px 0 0',
			fz: '14px',
			fl: 'r',
			color: '#9F9F9F',
			'.fa-flash': {
				color: '#CC151A'
			},
			'.desc': {
				pos: 'a',
				fz: '12px',
				right: '14px',
				top: '60px',
				wid: '300px',
				lh: '20px',
				ta: 'r',
				d: 'b'
			}
		}
	},
	html: '[data-component="status"]',
	status: 'disconnected',
	constructor: function(host, port) {
		this.host = host;
		this.port = port;
		this.populate();
	},
	setStatus: function(s) {
		this.status = s ? 'connected' : 'disconnected';
		this.css['[data-component="status"]']['.desc'].d = s ? 'n' : 'b';
		this.css['[data-component="status"]']['.fa-flash'].color = s ? '#26A430' : '#CC151A';
		this.populate();
	}
})