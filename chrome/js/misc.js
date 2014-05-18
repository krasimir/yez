var button = function() {
	return {
		d: 'ib',
		color: '#000',
		ted: 'n',
		pad: '4px 10px',
		bg: '#E7E7E7',
		bdb: 'solid 1px #919191',
		bdrsa: '8px',
		mar: '0 6px 0 0',
		'&:hover': {
			bg: '#D5D5D5'
		}
	}
}
var buttonTransparent = function() {
	return {
		opacity: 0.4,
		'&:hover': {
			opacity: 1
		}
	}
}
var ids = 0;
var getId = function() {
	ids +=1;
	return 't' + ids;
}
var normalizePath = function(p) {
	return p.replace(/\\/g, '/');
}
absurd = Absurd();