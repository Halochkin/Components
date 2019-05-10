## unloadCallbackMixin
 This mixin registers an `unloadCallback()` which will call `disconnectedCallback()` when the user closes the tab. It based on `unload` event which fired when the document or a child resource is being unloaded.
### Problem 1 
This "bug" that `disconnectedCallback` is not called when the user close a tab - event listeners will not be removed, then your element might leave a lot of old event listeners still registered, gumming up the system if the browser does not automatically clean up such things. Which old browser might not be able to do. 
### Problem 2
Quite often, you have to establish a connection to a database or some other third-party installation that you want to guarantee is always closed. But what can happen if people just open your page and then close it immediately? 
Each database connection is an open socket plus on both sides (client and server) of the data structure that stores the state of that connection, and (most importantly) data caches that can grow to quite large sizes.<br>
But this is not the worst. Much worse is that in the configs almost any database is marked limit active connections, after which the server stops accepting new connections. And this limit is set with the expectation that the server copes with the corresponding number of really active (that is, relatively loaded) connections, does not hang at the same time and would not use all the memory when trying to execute requests from all connections simultaneously. Accordingly, this limit is set quite low and is not designed to ensure that hung connections accumulate tens of thousands.

<p align="center">
 <img src="https://preview.ibb.co/nHqPyz/Corel_DRAW_X7_Graphic.png" border="0">
</p><br>

### Solution
Each time the user closes the tab, `unloadCallback()` activates the function responsible for deactivating the connection to database. This means that the user will deactivate the connection in any case, and the probability that your database will stop responding to requests due to the exhaustion of the connection limit is significantly reduced.



***

```javascript
const unloadEvent = Symbol("unloadEvent");

const closeArray = [];

const handler = function () {                                       //[3]
  for (let entry of closeArray) {
    if (entry.unloadCallback)
      entry.unloadCallback();
  }
};
window.addEventListener("unload", handler);                         //[1]

export const UnloadCallbackMixin = (Base) => {
  return class extends Base {

    constructor() {
      super();
      this[unloadEvent] = true;
      closeArray.push(this)                                           //[2]
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();   //[4]
      window.removeEventListener("unload", handler);
      if (!this[unloadEvent]) return;
      for (let entry of closeArray) {
        closeArray.remove(entry);
      }
      this[unloadEvent] = false;
    }
  }
};

```
***
1. When the mixin is initiatized, it adds a listener for the page close event.
2. Every time the constructor runs, it adds the object to a global array in the mixin.
3. When this listener is activated, it runs the list and calls deletedCallback from outside.
4. When `disconnectedCallback` is fired it check whether there is `disconnectedCallback()` inside the implemented class and will trigger it. Then it removes an event listener and the call from the global list and also sets a local value to false, which `disconnectedCallback` itself uses to not run the same method in subsequent calls.

### Example

```javascript

  import {UnloadCallbackMixin} from "./unloadCallbackMixin.js"  //[1]

  class unloadElement extends UnloadCallbackMixin(HTMLElement) {
    constructor() {
      super();
    }

    connectedCallback(){                                         //[2]
      this.addEventListener("click", this.someFuction);
    }
    
    disconnectedCallback(){                                      //[4]
      this.removeEventListener("click", this.someFuction);
    }
    
    someFunction(){
      alert("Hello");
    }
    
    unloadCallback() {                                           //[3]
      super.disconnectedCallback();
    }

  }

  customElements.define("unload-element", unloadElement);

```
***
1. Import of mixin. First of all, it will add an element to the global array.
2. Add an event listener.
3. When the user closes the tab `unloadCallback()` will be activated. It will trigger its own `disconnectedCallback()` using the `super` keyword. Belonging to the mixin `disconnectedCallback()` will call `disconnectedCallback()` from `unloadElement` class after which the event listener will be removed. 

```no-highlight
//todo and important comments from Hangouts)
1. The layers are constructor+unload outside, then connected +disconnected on the inside.
2. And that the rule in unloadCallback is to call super.unloadCallback every time it is implemented?
3.  You might need to clean up this array.. Not sure how best to do that. It might not be necessary if it is a weakset and not an array.
4. We might need to trigger the unloadCallback from disconnectedCallback.. Or not. But to see this clearly i need to write the discussion for this thing first.

```



