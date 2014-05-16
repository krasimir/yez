var i = 10;
(function process() {
	if(i > 0) {
		i--;
		console.log('hello ' + i);
		if(i == 4) {
			throw new Error('Ops!');
		}
		setTimeout(process, 60);
	}
})();