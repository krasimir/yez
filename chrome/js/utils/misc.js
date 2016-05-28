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