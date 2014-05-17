var Task = absurd.component('Task', {
	css: {
		'.task': {
			'.actions': {
				bxz: 'bb',
				'.title': {
					fz: '20px'
				}
			},
			'.elements': {
				'.element': {
					wid: '100%',
					bxz: 'bb',
					mar: '6px 0 6px 0',
					label: {
						wid: '30%',
						pad: '0 20px 0 0',
						bxz: 'bb',
						bg: '#EDE9E0',
						fl: 'l',
						pad: '10px',
						bdtlrs: '10px',
						bdblrs: '10px',
						ta: 'r',
						bdr: 'solid 2px #DECAB6',
						bdb: 'solid 1px #999',
						hei: '47px',
						ov: 'h'
					},
					'.field': {
						wid: '70%',
						fl: 'l',
						bxz: 'bb',
						bg: '#F8F5EF',
						bdtrrs: '10px',
						bdbrrs: '10px',
						bdb: 'solid 1px #999',
						input: {
							hei: '46px',
							bd: 'n',
							bg: 'n',
							bxz: 'bb',
							wid: '100%',
							pad: '10px'
						}
					},
					'&:after': {
						content: '" "',
						d: 'tb',
						clear: 'both'
					}
				}
			}
		}
	},
	html: {
		'.task': {
			'.actions': {
				'span.title': 'Task'
			},
			'.elements': {
				'.element': {
					label: 'Working directory:',
					'.field': {
						'input[type="text"]': ''
					}
				}
			}
		}
	},
	constructor: function() {
		this.populate();
	},
	append: function(component) {
		
	}
})