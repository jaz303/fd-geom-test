module.exports = function(tape, topLevel) {

    function isObject(thing) {
        return thing
            && (typeof thing === 'object')
            && (typeof thing.clone === 'function')
            && (typeof thing.eq === 'function');
    }

    function clone(obj) {
        if (Array.isArray(obj)) {
            return obj.map(clone);
        } else if (obj && typeof obj === 'object') {
            if (isObject(obj)) {
                return obj.clone();
            } else {
                throw new Error("objects must be cloneable");
            }
        } else {
            return obj;
        }
    }

    function isEqual(left, right, opts) {
        if (left && typeof left === 'object') {
            if (opts.compareProperties) {
                for (var k in left) {
                    var l = left[k], r = right[k];
                    if (opts.inexact) {
                        if (Math.abs(l - r) >= 0.000001) {
                            return false;
                        }
                    } else {
                        if (l !== r) {
                            return false;
                        }
                    }
                }
                return true;
            } else if (typeof left.eq === 'function') {
                return left.eq(right);
            } else {
                throw new Error("object must have eq() method");
            }
        } else {
            if (opts.inexact) {
                return Math.abs(left - right) < 0.000001;
            } else {
                return left === right;    
            }
        }
    }

    function testResult(assert, expected, actual, opts) {
        assert.ok(isEqual(expected, actual, opts || {}));
    }

    function testObjectMethod(receiver, method, args, expected, opts) {
        tape("." + method + "()", function(assert) {
            var actual = receiver[method].apply(receiver, args);
            testResult(assert, expected, actual, opts);
            assert.end();
        });
    }

    function testSelfMutatingObjectMethod(receiver, method, args, expected, opts) {
        
        method += '_';
        if (!receiver[method]) {
            return;
        }

        tape("." + method + "()", function(assert) {
            receiver[method].apply(receiver, args);
            testResult(assert, expected, receiver, opts);
            assert.end();
        });

    }

    function testFunctionInterface(receiver, method, args, expected, opts) {

        tape("exports." + method + "()", function(assert) {
            
            args.unshift(receiver);

            if (isObject(expected)) {
                args.push(receiver);
                topLevel[method].apply(null, args);
                testResult(assert, expected, receiver, opts);
            } else {
                var res = topLevel[method].apply(null, args);
                testResult(assert, expected, res, opts);
            }

            assert.end();

        });

    }

    function test(methodName, object, args, expectedResult, opts) {

        testObjectMethod(
            clone(object),
            methodName,
            clone(args),
            expectedResult,
            opts
        );

        testSelfMutatingObjectMethod(
            clone(object),
            methodName,
            clone(args),
            expectedResult,
            opts
        );

        testFunctionInterface(
            clone(object),
            methodName,
            clone(args),
            expectedResult,
            opts
        );

    }

    function binaryOperator(methodName, left, right, expectedResult, opts) {
        test(
            methodName,
            clone(left),
            [clone(right)],
            clone(expectedResult),
            opts
        );
    }

    function unaryOperator(methodName, left, expectedResult, opts) {
        test(
            methodName,
            clone(left),
            [],
            clone(expectedResult),
            opts
        );
    }

    return {
        test            : test,
        binaryOperator  : binaryOperator,
        unaryOperator   : unaryOperator
    };

}