// let res;
export const testUnstoppable = [{
  name: "unstoppable: normal stopPropagation",
  fun: function (res) {
    //res = "";
    const h1 = document.createElement("h1");

    function a(e) {
      e.stopPropagation();
    }

    function b(e) {
      res.push("b");
    }

    h1.addEventListener("click", a);
    h1.addEventListener("click", b, {unstoppable: true});
    h1.dispatchEvent(new Event("click", {bubbles: true}));
  },
  expect: "b",
  result: function () {
    return res;
  }
}, {
  name: "unstoppable: different type",
  fun: function (res) {
    //res = "";
    const h1 = document.createElement("h1");
    const span = document.createElement("span");
    h1.appendChild(span);

    function a(e) {
      e.stopImmediatePropagation();
    }

    function b(e) {
      res.push("b");
    }

    h1.addEventListener("click", a);
    h1.addEventListener("click", b, {unstoppable: true});
    h1.addEventListener("dblclick", a);
    h1.addEventListener("dblclick", b);
    h1.dispatchEvent(new Event("click", {bubbles: true}));
    h1.dispatchEvent(new Event("dblclick", {bubbles: true}));
  },
  expect: "b",
  result: function () {
    return res;
  }
}, {
  name: "unstoppable: different phase",
  fun: function (res) {
    //res = "";
    const h1 = document.createElement("h1");
    const span = document.createElement("span");
    h1.appendChild(span);

    function a(e) {
      e.stopPropagation();
    }

    function b(e) {
      res.push("b");
    }

    function c(e) {
      res.push("c");
    }

    span.addEventListener("click", a);
    span.addEventListener("click", b);//stopPropagation() doesn't work on the same node
    span.addEventListener("click", c, {unstoppable: true});//unstoppable
    h1.addEventListener("click", b, {unstoppable: true});//unstoppable
    h1.addEventListener("click", c);                            //stoppable and on a different node than stopPropagation()
    span.dispatchEvent(new Event("click", {bubbles: true}));
  },
  expect: "bcb",
  result: function () {
    return res;
  }
}, {
  name: "unstoppable: stopPropagation",
  fun: function (res) {
    //res = "";
    const h1 = document.createElement("h1");

    function a(e) {
      e.stopPropagation();
    }

    function b(e) {
      res.push("b");
    }

    h1.addEventListener("click", a);
    h1.addEventListener("click", b, {unstoppable: true});
    h1.dispatchEvent(new Event("click", {bubbles: true}));
  },
  expect: "b",
  result: function () {
    return res;
  }
}, {
  name: "unstoppable: stopImmediatePropagation",
  fun: function (res) {
    //res = "";
    const h1 = document.createElement("h1");

    function a(e) {
      e.stopImmediatePropagation();
    }

    function b(e) {
      res.push("b");
    }

    function c(e) {
      res.push("c");
    }

    h1.addEventListener("click", a);
    h1.addEventListener("click", b);
    h1.addEventListener("click", c, {unstoppable: true});
    h1.dispatchEvent(new Event("click", {bubbles: true}));
  },
  expect: "c",
  result: function () {
    return res;
  }
}];