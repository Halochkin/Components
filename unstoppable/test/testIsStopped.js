//todo 1. test isStopped during propagation.
//todo 2. test before dispatch
//todo 3. test when dispatch the same event object twice.
//todo 4. test when stopPropagation called inside shadowDom, both normal and slotted.

export const testIsStopped = [
  {
    name: "isStopped: before dispatch",
    fun: function (res) {
      const h1 = document.createElement("h1");
      h1.addEventListener("click", function (e) {
        res.push("omg");
      })
      const event = new Event("click");
      event.stopPropagation();
      res1 += isStopped(event) ? "1" : "wtf1";
      h1.dispatchEvent(event);
      const event2 = new Event("click");
      event2.stopImmediatePropagation();
      res1 += isStopped(event2) ? "2" : "wtf2";
      h1.dispatchEvent(event2);
      const event3 = new Event("click");
      event3.stopPropagation();
      res1 += isStopped(event3, true) ? "3" : "wtf3";
      h1.dispatchEvent(event3);
      const event4 = new Event("click");
      event4.stopImmediatePropagation();
      res1 += isStopped(event4, true) ? "4" : "wtf4";
      h1.dispatchEvent(event4);
    },
    expect: "1234",
    result: function () {
      return res1;
    }
  }, {
    name: "isStopped: stopPropagation() and stopImmediatePropagation() before dispatch",
    fun: function (res) {
      const dom = cleanDom();
      dom.shadowComp
      dom.shadowH1.dispatchEvent(new Event("click"));
    },
    expect: "shadowRoot shadowH1 shadowH1 +-+:122",
    result: function () {
      return res1 + res2 + ":" + res3;
    }
// }, {
//   name: "isStopped: stopPropagation() and stopImmediatePropagation() before dispatch",
//   fun: function () {
//     res1 = res2 = res3 = "";
//     const dom = cleanDom();
//     dom.shadowComp
//     dom.shadowH1.dispatchEvent(new Event("click"));
//   },
//   expect: "shadowRoot shadowH1 shadowH1 +-+:122",
//   result: function () {
//     return res1 + res2 + ":" + res3;
//   }
  }];