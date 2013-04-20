var def = kainEngine.def;

var item = {
	desc : 'Nic zvláštního.',
	aku : 'něco'
}

var G = {};

G.sirky = def(item, {
	desc : 'Obyčejné sirky.',
	aku : 'sirky',
	w : 'HERO'
});

G.stoh = def(item, {
	desc : 'Slaměný stoh.',
	aku : 'stoh',
	w : 'zde'
});

snack.ready( function() {
	var K = kainEngine.setup(G, {output:'#output', verbs:'#verbs', items:'#items', dialog:'#dialogue', next:'#next'});
	K.defineVerb('desc', 'prozkoumej', ['aku']);
	K.defineVerb('take', 'seber', ['aku']);
	K.defineVerb('use', 'použij', ['aku']);
	K.defineVerb('use_with', 'použij (na)', ['aku', 'aku']);
	K.defineVerb('wait', 'čekej', []);
	K.here = 'zde';
	K.print('Severák uvádí...').print('Testovací hru');
});