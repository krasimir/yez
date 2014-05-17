var Content = absurd.component('Content', {
	css: { '[data-component="content"]': { d: 'n' } },
	html: '[data-component="content"]',
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
	},
	visible: function(v) {
		this.el.style.display = v ? 'block' : 'none';
	}
})