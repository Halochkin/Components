const unloadEvent = Symbol("unloadEvent");

const closeArray = [];

const handler = function () {
  for (let entry of closeArray) {
    if (entry.unloadCallback)
      entry.unloadCallback();
  }
};
window.addEventListener("unload", handler);

export const UnloadCallbackMixin = (Base) => {
  return class extends Base {

    constructor() {
      super();
      this[unloadEvent] = true;
      closeArray.push(this)
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      window.removeEventListener("unload", handler);
      if (!this[unloadEvent]) return;
      for (let entry of closeArray) {
        closeArray.remove(entry);
      }
      this[unloadEvent] = false;
    }
  }
};
