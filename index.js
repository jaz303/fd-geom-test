var tape = require('tape');

function clone(obj) {
    if (obj && typeof obj === 'object') {
        if (typeof obj.clone === 'function') {
            return obj.clone();
        } else {
            throw new Error("objects must be cloneable");
        }
    } else {
        return obj;
    }
}

function isEqual(left, right, inexact) {
    if (left && typeof left === 'object') {
        if (typeof left.eq === 'function') {
            return left.eq(right);
        } else {
            throw new Error("object must have eq() method");
        }
    } else {
        if (inexact) {
            return Math.abs(left - right) < 0.000001;
        } else {
            return left === right;    
        }
    }
}

function testResult(assert, expected, actual, opts) {
    assert.ok(isEqual(expected, actual, opts ? (!!opts.inexact) : false));
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

function testFunctionInterface(exp, receiver, method, args, expected, opts) {
    
    tape("exports." + method + "()", function(assert) {
        
        args.unshift(receiver);

        if (Array.isArray(expected)) {
            args.push(receiver);
            exp[method].apply(null, args);
            testResult(assert, expected, receiver, opts);
        } else {
            var res = exp[method].apply(null, args);
            testResult(assert, expected, res, opts);
        }

        assert.end();

    });

}

exports.test = test;
function test(exp, methodName, object, args, expectedResult, opts) {

    function mkargs() { return args.map(clone); }

    testObjectMethod(
        object.clone(),
        methodName,
        mkargs(),
        expectedResult,
        opts
    );

    testSelfMutatingObjectMethod(
        object.clone(),
        methodName,
        mkargs(),
        expectedResult,
        opts
    );

    testFunctionInterface(
        exp,
        object.clone(),
        methodName,
        mkargs(),
        expectedResult,
        opts
    );

}

exports.binaryOperator = function(exp, methodName, left, right, expectedResult, opts) {
    test(
        exp,
        methodName,
        clone(left),
        [right].map(clone),
        clone(expectedResult),
        opts
    );
}

exports.unaryOperator = function(exp, methodName, left, expectedResult, opts) {
    test(
        exp,
        methodName,
        clone(left),
        [],
        clone(expectedResult),
        opts
    );
}
