const stripeApi = require("stripe");
const q = require("daskeyboard-applet");
const logger = q.logger;

class StripeApplet extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60000;
    this.lastChargeTime = this.store.get("lastChargeTime");
  }

  async applyConfig() {
    let apiKey = this.authorization.apiKey;
    this.stripe = stripeApi(apiKey);
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
    logger.info(`Querying API with params: ${JSON.stringify(params)}`);

    return new Promise((resolve) => {
      this.stripe.charges.list(
        params, (err, charges) => {
          if (err) {
            logger.error(`Got error accessing Stripe API: ${err}`);
            resolve(q.Signal.error(
              'The Stripe service returned an error. Please check your API key and account.'
              ));
          } else if (charges && charges.data && charges.data.length > 0) {
            logger.info(`Got ${charges.data.length} charges.`);
            this.lastChargeTime = charges.data[0].created;
            this.store.put("lastChargeTime", this.lastChargeTime);
            resolve(new q.Signal({
              points: [
                [new q.Point('#00FF00')]
              ]
            }));
          } else {
            logger.info(`No new charges since last query.`);
            resolve(null);
          }
        }
      );
    });
  }
}

const stripeApplet = new StripeApplet();
module.exports = {
  StripeApplet: StripeApplet
}