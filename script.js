/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  // your code here
  let coffeeCounter = document.getElementById("coffee_counter");
  coffeeCounter.innerText = coffeeQty;
}

function clickCoffee(data) {
  // your code here
  data.coffee = data.coffee + 1;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  // your code here
  producers.map((producer) => {
    if (producer.price / 2 <= coffeeCount) {
      producer.unlocked = true;
    }
  });
}

function getUnlockedProducers(data) {
  // your code here
  let unlocked = data.producers.filter((producer) => {
    return producer.unlocked;
  });
  return unlocked;
}

function makeDisplayNameFromId(id) {
  // your code here
  let displayName = id
    .split("_")
    .map((word) => {
      word = word[0].toUpperCase() + word.slice(1);
      return word;
    })
    .join(" ");
  return displayName;
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement("div");
  containerDiv.className = "producer";
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <div class="producer-actions">
      <button type="button" class="buy" id="buy_${producer.id}">Buy</button>
      ${
        producer.qty >= 1
          ? `<button type="button" class="sell-one" id="sell_one_${
              producer.id
            }">Sell For ${Math.floor(producer.price / 1.25)} coffee</button>`
          : ""
      }
      ${
        producer.qty >= 2
          ? `<button type="button" class="sell-all" id="sell_all_${
              producer.id
            }">Sell All For ${Math.floor(
              (producer.price * producer.qty) / 1.25
            )} coffee</button>`
          : ""
      }
    </div>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  // your code here
  let children = [...parent.childNodes];
  children.map((child) => {
    parent.removeChild(child);
  });
}

function renderProducers(data) {
  // your code here
  unlockProducers(data.producers, data.coffee);
  let unlockedProducers = getUnlockedProducers(data);
  let producersSection = document.getElementById("producer_container");
  deleteAllChildNodes(producersSection);
  unlockedProducers.map((producer) => {
    let producerDiv = makeProducerDiv(producer);
    producersSection.appendChild(producerDiv);
  });
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  // your code here
  return data.producers.filter((producer) => {
    return producer.id === producerId;
  })[0];
}

function canAffordProducer(data, producerId) {
  // your code here
  let producer = getProducerById(data, producerId);
  let canAfford = producer.price <= data.coffee ? true : false;
  return canAfford;
}

function updateCPSView(cps) {
  // your code here
  let cpsContainer = document.getElementById("cps");
  cpsContainer.innerText = cps;
}

function updatePrice(oldPrice) {
  // your code here
  let newPrice = Math.floor(oldPrice * 1.25);
  return newPrice;
}

function attemptToBuyProducer(data, producerId) {
  // your code here
  let affordable = canAffordProducer(data, producerId);
  let producer = getProducerById(data, producerId);
  if (affordable) {
    producer.qty = producer.qty + 1;
    data.coffee = data.coffee - producer.price;
    producer.price = updatePrice(producer.price);
    data.totalCPS = data.totalCPS + producer.cps;
  }
  return affordable;
}

function buyButtonClick(event, data) {
  // your code here
  if (event.target.tagName === "BUTTON") {
    let buttonId = event.target.id;
    let producerId = buttonId.substring(4);
    let canAfford = canAffordProducer(data, producerId);
    if (!canAfford) {
      window.alert("Not enough coffee!");
    } else {
      attemptToBuyProducer(data, producerId);
      renderProducers(data);
      updateCPSView(data.totalCPS);
      updateCoffeeView(data.coffee);
    }
  }
}

function tick(data) {
  // your code here
  data.coffee = data.coffee + data.totalCPS;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

// Function to save data to local storage
function saveGameData(data) {
  localStorage.setItem("data", JSON.stringify(data));
}

function updateElapsedTimeData(data) {
  "use strict";
  if (Object.keys(localStorage).includes("exitTime")) {
    let exitTime = new Date(JSON.parse(localStorage.exitTime));
    let now = new Date();
    let secondsElapsed = Math.floor(
      (now.getTime() - exitTime.getTime()) / 1000
    );
    data.coffee = data.coffee + secondsElapsed * data.totalCPS;
  }
}
function retrieveSavedData() {
  "use strict";
  if (Object.keys(localStorage).includes("data")) {
    let localData = JSON.parse(localStorage.data);
    return localData;
  }
}

// Sell Producer Buttons Functions
function sellOneButtonClick(event, data) {
  let buttonId = event.target.id;
  let producerId = buttonId.substring(9);
  let producer = getProducerById(data, producerId);
  let sellPrice = Math.round(producer.price / 1.25);
  if (producer.qty >= 1) {
    data.totalCPS = data.totalCPS - producer.cps;
    producer.qty = producer.qty - 1;
    producer.price = sellPrice;
    data.coffee = data.coffee + sellPrice;
    renderProducers(data);
    updateCoffeeView(data.coffee);
    updateCPSView(data.totalCPS);
  }
}

function sellAllButtonClick(event, data) {
  let buttonId = event.target.id;
  let producerId = buttonId.substring(9);
  let producer = getProducerById(data, producerId);
  let sellPrice = Math.round((producer.price / 1.25) * producer.qty);
  let newPrice = Math.round(
    (producer.price * producer.qty) / (1.25 * producer.qty)
  );
  if (producer.qty >= 1) {
    data.totalCPS = data.totalCPS - producer.cps * producer.qty;
    producer.qty = 0;
    producer.price = newPrice;
    data.coffee = data.coffee + sellPrice;
    renderProducers(data);
    updateCoffeeView(data.coffee);
    updateCPSView(data.totalCPS);
  }
}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === "undefined") {
  // Get starting data from the window object
  // (This comes from data.js)
  let data = window.data;

  // Load Local Storage data on page load if already defined and set up DOM with existing data
  if (Object.keys(localStorage).includes("data")) {
    data = retrieveSavedData();
    updateElapsedTimeData(data);
    updateCPSView(data.totalCPS);
    updateCoffeeView(data.coffee);
    renderProducers(data);
  }

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById("big_coffee");
  bigCoffee.addEventListener("click", () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById("producer_container");
  producerContainer.addEventListener("click", (event) => {
    if (event.target.className === "buy") {
      buyButtonClick(event, data);
    } else if (event.target.className === "sell-one") {
      sellOneButtonClick(event, data);
    } else if (event.target.className === "sell-all") {
      sellAllButtonClick(event, data);
    }
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);

  // Call save game data function once per second
  setInterval(() => saveGameData(data), 1000);
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick,
  };
}

// Check for user exiting page (window.unload) and save date and time
window.addEventListener("unload", function () {
  let exitTime = new Date();
  localStorage.setItem("exitTime", JSON.stringify(exitTime));
});
