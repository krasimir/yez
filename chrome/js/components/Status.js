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
			'.info': {
				pos: 'a',
				fz: '12px',
				right: '14px',
				top: '60px',
				wid: '300px',
				lh: '20px',
				ta: 'r',
				d: 'b',
				bg: '#FFF',
				pad: '10px',
				bxsh: '0px 0px 1px #888888'
			}
		}
	},
	html: '[data-component="status"]',
	status: 'disconnected (1 retry)',
	constructor: function(host, port) {
		this.host = host;
		this.port = port;
		this.populate();
	},
	setStatus: function(s, retry) {
		window.status = this;
		this.status = s ? 'connected' : 'disconnected (' + retry + ' ' + (retry > 1 ? ' retries' : ' retry') + ')';
		this.css['[data-component="status"]']['.info'].d = s ? 'n' : 'b';
		this.css['[data-component="status"]']['.fa-flash'].color = s ? '#26A430' : '#CC151A';		
		this.populate();
	}
})