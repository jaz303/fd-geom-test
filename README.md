# fd-geom-test

This library probably isn't much use to anyone but myself but read on if you're curious!

`fd-geom-test` is a helper library I've been using to test my recent spate of geometry libraries such as `fd-vec2`, `fd-size`, `fd-rect`, and so-on.

Geometry code often involves manipulating lots of temporary intermediate data, and since these are usually composite values such as points and rectangles it's necessary to represent them using objects. Rapdi allocating all of such temporary values, however, can be inefficient, so sometimes it makes sense ease GC pressure by reusing previously-allocated objects rather than creating new ones. On the flip-side, unfortunately, this style of programming often results in a more verbose and somewhat opaque API. Compare:

```javascript
var v1 = vec2(1, 6);
var v2 = vec2(3, 5);
var v3 = vec2(10, 20);

return v1.add(v2).add(v3);
```

with

```javascript
var v1 = vec2(1, 6);
var v2 = vec2(3, 5);
var v3 = vec2(10, 20);

// v1 <- v1 + v2
vec2.add(v1, v2, v1);

// v1 <- v1 + v3
vec2.add(v1, v3, v1);

return v1;
```

The second example creates two fewer temporary objects but the prices is that its API is less intuitive. Most of the time, however, we're not worried about efficiency so the code in the more readable first example should be fine.

All of my geometry libraries expose their operations through three "flavours" of API, allowing readable code to be used the majority of the time, with the option to drop down to more memory-efficient methods as necessary. The three API flavours are:

  * an object interface e.g. `v1.add(v2)`. These operations always return brand new instances and should perform deep-cloning as necessary.
  * a self-mutating object interface; this is denoted by trailing underscore, e.g. `v1.add_(v2)`. These operations modify the receiver in-place.
  * a single-function imperative interface that accepts the "receiver" as the first parameter and arguments in successive positions. For any operation that produces a complex value (as opposed to a scalar), there is a final `out` parameter which receives the result value which should must be pre-initialised with an instance of the correct type. All operations **must** function correctly if the same object is passed in multiple argument positions e.g. `vec2.add(v1, v2, v1)`, which adds `v2` to `v1` and stores the result in `v1`.
  
Additionally, each object class obeys the following contract:
  
  1. all object instances have a `clone()` method which returns a new instance with the same value(s)
  2. all object instances have an `eq()` method for testing equality with other instances
    
Based on this contract, `fd-geom-test` exposes a set of helper fucntions to simultaneously test all three API variants. For example:

```javascript
var tape = require('tape');

var vec2 = require('fd-vec2');

require('fd-geom-test')(tape).binaryOperator(
	vec2,
	'add',
	new vec2.Vec2(10, 15),
	new vec2.Vec2(30, 50),
	new vec2.Vec2(40, 65)
);
```

The above code tests that all three variants of the `add` calculate the same result.