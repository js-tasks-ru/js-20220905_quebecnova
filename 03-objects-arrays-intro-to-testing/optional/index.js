export class Functions {
  returnTrue0(a) {
    return a;
  }

  returnTrue1(a) {
    return typeof a !== "object" && !Array.isArray(a) && a.length === 4;
  }

  returnTrue2(a) {
    return a !== a;
  }

  returnTrue3(a, b, c) {
    return a && a == b && b == c && a != c;
  }

  returnTrue4(a) {
    return a++ !== a && a++ === a;
  }

  returnTrue5(a) {
    return a in a;
  }

  returnTrue6(a) {
    return a[a] == a;
  }

  returnTrue7(a, b) {
    return a === b && 1 / a < 1 / b;
  }
}
