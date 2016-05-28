var Status = absurd.component('Status', {
	html: '[data-component="status"]',
	constructor: function(host, port) {
		this.host = host;
		this.port = port;
		this.populate();
	},
	setStatus: function(s, retry) {		
		if (s)  {
			this.addClass('online');
			this.qs('.status').innerText = 'Status: connected';
		}
		else {
			this.removeClass('online');
			this.qs('.status').innerText = 'Status: disconnected (' + retry + ' ' + (retry > 1 ? ' retries' : ' retry') + ')';
		}
	}
})