var Content = absurd.component('Content', {
	css: { '[data-component="content"]': {} },
	html: '[data-component="content"]',
	constructor: function() {
		this.populate();
	},
	append: function(component) {
		this.populate();
		if(!component.el) {
			component.populate();
		}
		this.el.innerHTML = '';
		this.el.appendChild(component.el);
	},
	visible: function(s) {
		this.css['[data-component="content"]'].d = s ? 'b' : 'n';
		this.populate();
	}
})