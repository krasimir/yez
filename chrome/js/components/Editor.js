var Editor = absurd.component('Editor', {
	html: {
		'.dialog': {
			'.content': {
				'.info': '<i class="fa fa-arrow-circle-o-right"></i> <% title %>',
				'.inner.editor': [
					{ 'textarea' : '<% initialContent %>' }
				],
				'.actions': [
					{ 'a[href="#" data-absurd-event="click:result:ok" class="button"]': '<i class="fa fa-check-circle-o"></i> OK'},
					{ 'a[href="#" data-absurd-event="click:result:cancel" class="button"]': '<i class="fa  fa-times-circle-o"></i> Cancel'}
				]
			}
		}
	},
	result: function(e, res) {
		e.preventDefault();
		if (this.callback && res === 'ok') this.callback(this.qs('textarea').value);
		document.querySelector('body').removeChild(this.populate().el);
	},
	constructor: function(cb, content, title) {
		var self = this;
		this.initialContent = content;
		this.title = title;
		this.callback = cb;
		this.populate();
		document.querySelector('body').appendChild(this.populate().el);
		setTimeout(function() {
			var ta = self.qs('textarea');
			ta.focus();
			ta.setSelectionRange(ta.value.length, ta.value.length);
		}, 400);
	}
});
