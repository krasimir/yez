var button = function() {
	return {
		d: 'ib',
		color: '#111',
		bg: '#E7E7E7',
		bdb: 'solid 1px #919191',
		ted: 'n',
		pad: '4px 10px',
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
var getId = function (prefix) {
    var d = new Date().getTime();
    d += (parseInt(Math.random() * 100)).toString();
    if (undefined === prefix) {
        prefix = 'uid-';
    }
    d = prefix + d;
    return d;
};
var normalizePath = function(p) {
	return p.replace(/\\/g, Yez.sep || '/');
}
absurd = Absurd();