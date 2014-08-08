function expect(expected, testBlock) {

	var testInstance = require('..')(function(msg, testFn) {

		var assert = {
			ok: function(actual) {
				if (expected !== actual) {
					process.stderr.write("ERROR\n");
					process.exit(1);
				}
			},
			end: function() {}
		};

		testFn(assert);

	});

	testBlock(testInstance);

}

function Box(v) { this.v = v; }
Box.prototype.eq = function(rhs) { return this.v === rhs.v };
Box.prototype.clone = function() { return new Box(this.v); };

Box.prototype.double = function() { return new Box(this.v * 2); }
Box.prototype.double_ = function() { this.v *= 2; }

Box.prototype.add = function(other) { return new Box(this.v + other.v); }
Box.prototype.add_ = function(other) { this.v += other.v; }

var fns = {
	double: function(v, out) {
		out.v = v.v * 2;
	},
	add: function(l, r, out) {
		out.v = l.v + r.v;
	}
};

expect(true, function(t) {
	
	t.unaryOperator(
		fns,
		'double',
		new Box(100),
		new Box(200)
	);	

	t.binaryOperator(
		fns,
		'add',
		new Box(10),
		new Box(15),
		new Box(25)
	);

});

expect(false, function(t) {
	
	t.unaryOperator(
		fns,
		'double',
		new Box(150),
		new Box(200)
	);	

	t.binaryOperator(
		fns,
		'add',
		new Box(10),
		new Box(500),
		new Box(25)
	);

});