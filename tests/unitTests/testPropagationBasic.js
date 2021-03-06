import {eventTargetName} from "./useCase1.js";
import {filterComposedTargets, lastPropagationTarget} from "../computePaths.js";


function addEventListeners(targets, res) {//todo push this into the usecase file?
  for (let el of targets) {
    let name = eventTargetName(el);
    el.addEventListener("click", function (e) {
      res.push(name.toUpperCase() + " ");
    }, true);
    el.addEventListener("click", function (e) {
      res.push(name.toLowerCase() + " ");
    });
  }
}


function makeExpectationBubblesComposed(usecase, options) {
  let scopedPath = usecase();
  if (!options.composed) {
    while (scopedPath[0] instanceof Array)
      scopedPath = scopedPath[0];
  }
  const bubbleOrTargetTrailNodes = options.bubbles ?
    scopedPath.flat(Infinity) :
    filterComposedTargets(scopedPath);
  const captureTrailNodes = scopedPath.flat(Infinity).reverse();

  const bubbleOrTargetTrail = bubbleOrTargetTrailNodes.map(name => eventTargetName(name).toLowerCase());
  const captureTrail = captureTrailNodes.map(name => eventTargetName(name).toUpperCase());

  return captureTrail.join(" ") + " " + bubbleOrTargetTrail.join(" ") + " ";
}

export const basicPropTest = [];


const propAlternatives = [
  {composed: true, bubbles: true},
  {composed: true, bubbles: false},
  {composed: false, bubbles: true},
  {composed: false, bubbles: false}
];

for (let options of propAlternatives) {
  basicPropTest.push({
    name: `propagation: ${JSON.stringify(options)}`,
    fun: function (res, usecase) {
      const targets = usecase().flat(Infinity);
      addEventListeners(targets, res);
      targets[0].dispatchEvent(new Event("click", options));
    },
    expect: function (usecase) {
      return makeExpectationBubblesComposed(usecase, options);
    }
  });
}



