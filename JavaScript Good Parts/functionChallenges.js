function add(first, second) {
  return first + second
}

function sub(first, second) {
  return first - second;
}

function mul(first, second) {
  return first * second;
}

function identityf(x) {
  return function () {
    return x;
  }
}

function addf(first) {
  return function(second) {
    return first + second;
  }
}

function liftf(binary) {
  return function(first) {
    return function(second) {
      return binary(first, second);
    }
  }
}

function curry(binary, first) {
  return liftf(binary)(first);
}

function twice(binary) {
  return function(a) {
    return binary(a, a);;
  }
}

function reverse(binary) {
  return function (first, second) {
    return binary(second, first);
  }
}

function composeu(f, g) {
  return function(a) {
    return g(f(a));
  }
}

function composeb(f, g) {
  return function(a, b, c){
    return g(f(a, b), c);
  }
}

function limit(binary, count) {
  return function(a, b) {
    if (count >= 1) {
      count -= 1;
      return binary(a, b);
    }
    return undefined;
  }
}

function from(start) {
  return function() {
    var next = start;
    start += 1;
    return next;
  }
}

function to(gen, end) {
  return function() {
    var value = gen();
    if (value < end) {
      return value;
    }
    return undefined;
  };
}

function fromTo(start, end) {
  return to(
    from(start),
    end
  );
}

function element(array, gen) {
  if (gen === undefined) {
    gen = fromTo(0, array.length); 
  }
  return function() {
    var index =gen();
    if (index !== undefined) {
      return array[index];
    }
  }
}

function collect(gen, array) {
  return function() {
    var value = gen();
    if (value !== undefined) {
      array.push(value);
    }
    return value;
  }
}

function filter(gen, predicate) {
  return function() {
    do {
      value = gen();
    } while (
      value !== undefined && !predicate(value)
    );
    return value;
  }
}

function concat(gen1, gen2) {
  var gen = gen1;
  return function() {
    var value = gen();
    if (value !== undefined) {
      return value;
    }
    gen = gen2;
    return gen();
  }
}

function gensymf(prefix) {
  var numer = 0;
  return function () {
    number += 1;
    return prefix + number;
  }
}

function fibonaccif(a,b) {
  var i = 0;
  return function () {
    var next;
    switch (i) {
      case 0:
        i = 1;
        return a;
      case 1:
          i = 2;
          return b;
        default:
          next = a + b;
          a = b;
          b = next;
          return next        
    }
  }
}

function counter(value) {
  return {
    up: function () {
      value += 1;
      return value;
    },
    down: function () {
      value -= 1;
      return value;
    }
  }
}

function revocable(binary) {
  return {
    invoke: function (first, second) {
      if (binary !== undefined) {
        return binary(first, second);
      }
    },
    revoke: function () {
      binary = undefined;
    }
  }
}

function m(value, source) {
  return {
    value: value,
    source: (typeof source === 'string')
      ? source
      : String(value)
  }
}

function addm(a, b) {
  return m(
    a.value + b.value,
    "(" + a.source + "+" + b.source + ")"
  );
}

function liftm(binary, op) {
  return function (a, b) {
    if (typeof a === 'number') {
      a = m(a);
    }
    if (typeof b === 'number') {
      b = m(b);
    }
    return m(
      binary(a.value, b.value),
    "(" + a.source + op + b.source + ")"
    )
  }
}

function exp(value) {
  return Array.isArray(value)
    ? value[0](
        exp(value[1]),
        exp(value[2]))
    : value;
}

function addg(first) {
  function more(next) {
    if  (next === undefined) {
      return first;
    }
    first += next;
    return more;
  }
  if (first !== undefined) {
    return more;
  }
}

function liftg(binary) {
  return function (first) {
    if (first === undefined) {
      return first;
    }
    return function more(next) {
      if (next === undefined) {
        return first;
      }
      first = binary(first, next);
      return more;
    };
  };
}

function arrayg(first){
  var array = [];
  function more(next){
    if (next === undefined) {
      return array;
    }
    array.push(next);
    return more;
  }
  return more(first);
}

function continuize(unary) {
  return function (callback, arg) {
    return callback(unary(arg));
  }
}

function constructor(init) {
  var that = other_constructor(init),
      member,
      method = function () {
        // init, member, method
      };
  that.method = method;
  return that;
}

function constructor(spec) {
  let {member} = spec;
  const {other} = other_constructor(spec);
  const method = function () {
    // spec,member, other, method
  };
  return Object.freeze({
    method,
    other
  });
}

// Vulnerable code
function vector() {
  var array = [];

  return {
    get: function get(i) {
      return array [i];
    },
    store: function store(i, v) {
      array[i] = v;
    },
    append: function append(v) {
      array.push(v);
    }
  };
}

// Attack
myvector = vector();
var stash;
myvector.store('push', function(){stash = this});
myvector.append(1);

// Fixed code
function vector() {
  var array = [];

  return {
    get: function get(i) {
      return array [+i]; // convert i to a number
    },
    store: function store(i, v) {
      array[+i] = v; // convert i to a number
    },
    append: function append(v) {
      array[array.length] = v; // don't rely on push method which can be changed
    }
  };
}

// Insecure
function pubsub() {
  var subscribers = [];
  return {
    subscribe: function (subscriber) {
      subscribers.push(subscriber);
    },
    publish: function (publication) {
      var i, length = subscribers.length;
      for (i = 0; i < length; i += 1) {
        subscribers[i](publication);
      }
    }
  }
}

// Secure
function pubsub() {
  var subscribers = [];
  return Object.freeze({
    subscribe: function (subscriber) {
      subscribers.push(subscriber);
    },
    publish: function (publication) {
      subscribers.forEach( function (s) {
        try {
          s(publication);
        } catch (ignore) {}
      });
    }
  });
}