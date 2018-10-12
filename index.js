const q = require("daskeyboard-applet");
const stripeApi = require("stripe");
const Storage = require('node-storage');
const Path = require('path');
const store = new Storage(Path.resolve(".", "local-storage.json"));

class StripeApplet extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60000;
    let apiKey = this.authorization.apiKey;
    this.stripe = stripeApi(apiKey);
    this.lastChargeTime = store.get("lastChargeTime");
  }

  async run() {
    let params = {
      limit: 10
    };

    if (this.lastChargeTime) {
      params.created = {
        gt: this.lastChargeTime
      };
    }
    console.log("Querying Square API with params:", JSON.stringify(params));

    this.stripe.charges.list(
      params, (err, charges) => {
        if (err) {
          console.error("Got error accessing Stripe API: ", err);
        } else if (charges && charges.data && charges.data.length > 0) {
          console.log(`Got ${charges.data.length} charges.`);
          this.lastChargeTime = charges.data[0].created;
          store.put("lastChargeTime", this.lastChargeTime);
          q.Send(new q.Signal([
            [new q.Point('#00FF00')]
          ]));
        } else {
          console.log("No new charges since last query.");
        }
      }
    )
  }
}

const stripeApplet = new StripeApplet();
stripeApplet.start();