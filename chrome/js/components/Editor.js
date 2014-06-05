var Editor = absurd.component('Editor', {
	css: extend(DialogStyles(), EditorStyles()),
	html: {
		'.dialog': {
			'.content': {
				'.info': '<i class="fa fa-arrow-circle-o-right"></i> <% title %>',
				'.inner.editor': [
					{ 'textarea' : '<% initialContent %>' }
				],
				'.actions': [
					{ 'a[href="#" data-absurd-event="click:result:ok"]': '<i class="fa fa-check-circle-o"></i> OK'},
					{ 'a[href="#" data-absurd-event="click:result:cancel"]': '<i class="fa  fa-times-circle-o"></i> Cancel'}
				]
			}
		}
	},
	result: function(e, res) {
		e.preventDefault();
		this.callback ? this.callback(res === 'ok' ? this.qs('textarea').value : this.initialContent) : null;
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
function EditorStyles() {
	return {
		'.dialog .content .info': {
			fz: '14px',
			lh: '18px',
			hei: '41px'
		},
		'.dialog .content .inner': {
			hei: 'calc(100% - 102px)'
		},
		'.editor': {
			textarea: {
				wid: '100%',
				hei: '100%',
				ff: "'Roboto', 'sans-serif'",
				bxz: 'bb',
				pad: '6px',
				bdrsa: '4px'
			}
		}
	}
}