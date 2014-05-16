var i = 10;
(function process() {
	if(i > 0) {
		i--;
		console.log('hello ' + i);
		setTimeout(process, 60);
	}
})();