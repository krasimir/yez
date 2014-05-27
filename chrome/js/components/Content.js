var Content = absurd.component('Content', {
	css: { '[data-component="content"]': { d: 'n' } },
	html: '[data-component="content"]',
	current: null,
	constructor: function() {
		this.populate();
	},
	append: function(component) {
		if(!component.el) {
			component.populate();
		}
		this.el.innerHTML = '';
		this.el.appendChild(component.el);
		if(component.appended) {
			component.appended();
		}
		this.current = component;
	},
	visible: function(v) {
		this.el.style.display = v ? 'block' : 'none';
	},
	passKeypressSignal: function(signal) {
		if(this.current && this.current[signal]) {
			this.current[signal]();
		}
	}
})