const assert = require('assert');
const t = require('../index');

//const auth = require('./auth.json');
const auth = null;

describe('StripeApplet', function () {
  let app = new t.StripeApplet();

  it('#constructor()', function () {
    assert.ok(app);
  });

  it('#run()', function () {
    if (auth) {
      app.processConfig({
        testMode: true,
        authorization: auth,
      });
      app.run().then((signal) => {
        console.log("Signal was: " + JSON.stringify(signal));
        assert.ok(null == signal || signal);
      }).catch(error => {
        assert.fail(error);
      });

    } else {
      console.log("Skipping run test because auth.json does not exist.");
    }
  });
})