export const cancelBubbleTests = [{
  name: "cancelBubble: beforeDispatch",
  fun: function (res) {
    const click = new MouseEvent("click");
    click.stopPropagation();
    res.push(click.cancelBubble);
  },
  expect: "1",
}, {
  name: "cancelBubble: same listener",
  fun: function (res) {
    const h1 = document.createElement("h1");
    h1.addEventListener("click", function (e) {
      e.stopPropagation();
      res.push(e.cancelBubble);
    });
    h1.click();
  },
  expect: "2",
}, {
  name: "cancelBubble: same event target and phase, different listener",
  fun: function (res) {
    const h1 = document.createElement("h1");
    h1.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    h1.addEventListener("click", function (e) {
      res.push(e.cancelBubble);
    });
    h1.click();
  },
  expect: "2",
}, {
  name: "cancelBubble: same event target and same capture phase",
  fun: function (res) {
    const h1 = document.createElement("h1");
    h1.addEventListener("click", function (e) {
      e.stopPropagation();
    }, true);
    h1.addEventListener("click", function (e) {
      res.push(e.cancelBubble);
    });
    h1.click();
  },
  expect: "2",
}, {
  name: "cancelBubble: same event target, but different phase",
  fun: function (res) {
    const h1 = document.createElement("h1");
    const h2 = document.createElement("h2");
    h1.appendChild(h2);
    h1.addEventListener("click", function (e) {
      e.stopPropagation();
    }, true);
    h1.addEventListener("click", function (e) {
      res.push("omg"); //this should never run
    });
    let click = new MouseEvent("click", {composed: true, bubbles: true});
    h2.dispatchEvent(click);
    res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.
    // That means that the browser cleans up the event when it is finished propagating.
    //this means we need to run async await on the wrapper for dispatchEvent.

  },
  expect: "1",
},
//todo test for the stopImmediatePropgation() behavior
  {
    name: "cancelBubble: same event target, but different phase, stopImmediatePropgation()",
    fun: function (res) {
      const h1 = document.createElement("h1");
      const h2 = document.createElement("h2");
      h1.appendChild(h2);
      h1.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
      });
      h1.addEventListener("click", function (e) {
        res.push(e.cancelBubble); //this should never run
      });
      let click = new MouseEvent("click", {composed: true, bubbles: true});
      h2.dispatchEvent(click);
      res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.
      // That means that the browser cleans up the event when it is finished propagating.
      //this means we need to run async await on the wrapper for dispatchEvent.

    },
    expect: "1",
  },
  {
    name: "cancelBubble: same event target, but different event listeners",
    fun: function (res) {
      const h1 = document.createElement("h1");
      h1.addEventListener("click", function (e) {
        e.stopPropagation();
      }, true);
      h1.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
        // res.push("omg"); //this should never run
      });
      let click = new MouseEvent("click", {composed: true, bubbles: true});
      h1.dispatchEvent(click);
      res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.
      // That means that the browser cleans up the event when it is finished propagating.
      //this means we need to run async await on the wrapper for dispatchEvent.

    },
    expect: "1",
  }, {
    name: "cancelBubble: different event target, the same event",
    fun: function (res) {
      const h1 = document.createElement("h1");
      h1.addEventListener("click", function (e) {
        e.stopPropagation();
      }, true);
      h1.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
        // res.push("omg"); //this should never run
      });
      let click = new MouseEvent("click", {composed: true, bubbles: true});
      h1.dispatchEvent(click);
      res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.


    },
    expect: "1",
  }, {
    name: "cancelBubble: same event target, but different event listeners. dispatch the same event twice",
    fun: function (res) {
      const h1 = document.createElement("h1");
      h1.addEventListener("click", function (e) {
        e.stopPropagation();
      }, true);
      h1.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
        // res.push("omg"); //this should never run
      });
      let click = new MouseEvent("click", {composed: true, bubbles: true});
      h1.dispatchEvent(click);
      h1.dispatchEvent(click);
      res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.
      // That means that the browser cleans up the event when it is finished propagating.
      //this means we need to run async await on the wrapper for dispatchEvent.

    },
    expect: "1",
  }, {
    name: "cancelBubble: different event target, dispatch the same event twice",
    fun: function (res) {
      const h1 = document.createElement("h1");
      const h2 = document.createElement("h2");
      h1.appendChild(h2);
      h1.addEventListener("click", function (e) {
        e.stopPropagation();
      });
      h2.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
        // res.push("omg"); //this should never run
      });
      let click = new MouseEvent("click", {composed: true, bubbles: true});
      h1.dispatchEvent(click);
      h1.dispatchEvent(click);
      h2.dispatchEvent(click);
      h2.dispatchEvent(click);
      res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.
      // That means that the browser cleans up the event when it is finished propagating.
      //this means we need to run async await on the wrapper for dispatchEvent.

    },
    expect: "1",
  }, {
    name: "cancelBubble: same event target, but in a different eventPhase,  dispatch the same event twice",
    fun: function (res) {
      const h1 = document.createElement("h1");
      const h2 = document.createElement("h2");
      h1.appendChild(h2);
      h1.addEventListener("click", function (e) {
        e.stopPropagation();
      }, true);
      h1.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
        // res.push("omg"); //this should never run
      });
      let click = new MouseEvent("click", {composed: true, bubbles: true});
      h1.dispatchEvent(click);
      h1.dispatchEvent(click);
      h2.dispatchEvent(click);
      h2.dispatchEvent(click);
      res.push(click.cancelBubble); //todo the browser returns false, when the event is finished propagating.
      // That means that the browser cleans up the event when it is finished propagating.
      //this means we need to run async await on the wrapper for dispatchEvent.

    },
    expect: "1",
  },
  //todo test cancelBubble on
  // *. different event listeners on the same target +
  // *. different event targets  +
  // *. the same event target, but in a different eventPhase +
  // *. different event event listeners on the same target, but dispatch the same event twice +
  // *. different event targets, but dispatch the same event twice +
  // *. the same event target, but in a different eventPhase, but dispatch the same event twice +


  // },  {
  // name: "cancelBubble",
  // fun: function(res) {
  //   const h1 = document.createElement("h1");
  //   h1.addEventListener("click", e=>e.stopPropagation());
  //   h1.addEventListener("click", e=> res.push(e.cancelBubble));
  //   h1.dispatchEvent(new Event("click"));
  // },
  // expect: "2",
  // result: function () {
  //   return res;
  // }
// }, {
//   name: "cancelBubble 2",
//   fun: function(res) {
//     //res = "";
//     const h1 = document.createElement("h1");
//
//     function a(e) {
//       res.push(" a " + e.cancelBubble);
//       e.cancelBubble = "yes, do it!!";
//     }
//
//     function b(e) {
//       res.push(" b " + e.cancelBubble);
//     }
//
//     h1.addEventListener("click", a);
//     h1.addEventListener("click", b);
//     h1.dispatchEvent(new Event("click"));
//   },
//   expect: " a false b true",
//   result: function () {
//     return res;
//   }
// }, {
//   name: "cancelBubble 3",
//   fun: function(res) {
//     //res = "";
//     const h1 = document.createElement("h1");
//
//     function a(e) {
//       res.push(" a " + e.cancelBubble);
//       e.cancelBubble = 0;
//     }
//
//     function b(e) {
//       res.push(" b " + e.cancelBubble);
//     }
//
//     h1.addEventListener("click", a);
//     h1.addEventListener("click", b);
//     h1.dispatchEvent(new Event("click"));
//   },
//   expect: " a false b false",
//   result: function () {
//     return res;
//   }
// }, {
//   name: "cancelBubble 4: before propagation begins",
//   fun: function(res) {
//     //res = "";
//     const h1 = document.createElement("h1");
//
//     function a(e) {
//       res.push("a");
//     }
//     h1.addEventListener("click", a);
//     const click = new Event("click");
//     click.stopPropagation();
//     h1.dispatchEvent(click);
//     const click2 = new Event("click");
//     click2.cancelBubble = true;
//     h1.dispatchEvent(click2);
//   },
//   expect: "",
//   result: function () {
//     return res;
//   }
];