function parse_table(data, name, opts) {
	if (name.slice(-4) === ".bin") throw new Error('Not implemented');
	return parse_table_xml(data, opts);
}

var parse_table_xml = (function make_ptablex() {
	return function parse_table_xml(data, opts) {
	
	var table = {};
	var columns = [];

	var expectedColumnCount = -1;

	var str = debom(xlml_normalize(data));
	(str.match(tagregex) || []).forEach(function (x) {
		var y = parsexmltag(x);
		switch (y[0]) {
			case '<table': {
				table.name = y['name'];
				table.displayName = y['displayName'];
				table.ref = y['ref'];
				table.includesTotalRow = y['totalsRowCount'] === '1';
				break;
			}
			case '<tableColumns': {
				expectedColumnCount = Number(y['count']) || -1;
				break;
			}
			case '<tableColumn': {
				columns.push({
					id: y['id'],
					name: y['name'],
				});
				break;
			}
			default:
				return;
		}
	});
		
	if (expectedColumnCount !== columns.length) {
		throw new Error('Parsed column count does not match expected value');
	}
		
	if (!table.ref) {
		throw new Error('Failed to parse table');
	}
		
    columns = columns.map((c, index) => Object.assign(c, {columnIndex: index}));
		
    return Object.assign(table, {
        range: decode_range(table.ref),
        columns,
    });
};
})();