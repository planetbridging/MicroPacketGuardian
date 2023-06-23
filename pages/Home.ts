/*document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("myButton");

  if (button && button.tagName === "BUTTON") {
    button.addEventListener("click", function () {
      console.log("Button clicked!");
    });
  }
});*/


class stateObj {
    ostate;
    oelement;

    constructor(elementId) {
        this.oelement = document.getElementById(elementId);
        this.ostate = { count: 0 };
        this.render();
    }

    set state(value) {
        this.ostate = value;
        this.render();
    }

    get state() {
        return this.ostate;
    }

    increment() {
        this.state = { count: this.ostate.count + 1 };
    }

    render() {
        if (this.oelement) {
            this.oelement.textContent = `Count: ${this.ostate.count}`;
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const component = new stateObj("myElement");
    const button = document.getElementById("myButton");

    if (button) {
        button.addEventListener("click", () => component.increment());
    }

    console.log("welcome to front end DOM of micro packet guardian");
});


