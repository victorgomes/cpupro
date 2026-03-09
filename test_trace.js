function add(a, b) {
  let x = a;
  while (b > 0) {
    x++;
    b--;
  }
  return x;
}

%PrepareFunctionForOptimization(add);
add(1, 2);
add(3, 4);
%OptimizeFunctionOnNextCall(add);
add(5, 6);
