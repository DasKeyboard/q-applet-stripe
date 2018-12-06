const assert = require('assert');
const fs = require('fs');

const {
  StripeApplet
} = require('../index');

const auth = fs.existsSync('./test/auth.json') ? require('./auth.json') : null;
console.log(`Auth: ${JSON.stringify(auth)}`);

describe('StripeApplet', function () {
  it('#constructor()', function () {
    let app = new StripeApplet();
    assert.ok(app);
  });

  describe('#run()', function () {
    it('runs normally', async function () {
      if (auth) {
        return buildApp().then(async (app) => {
          return app.run().then(async (signal) => {
            assert.ok(null == signal || signal);
          }).catch(error => {
            assert.fail(error);
          });
        });
      } else {
        console.log("Skipping run test because auth.json does not exist.");
      }
    });

    it('signals error when API key is bad', async function () {
      if (auth) {
        return buildApp({
          authorization: {
            apiKey: 'bad',
          }
        }).then(async (app) => {
          return app.run().then(async (signal) => {
            console.log("Signal was: " + JSON.stringify(signal));
            assert.ok(null == signal || signal);
            assert.equal('ERROR', signal.action);
          }).catch(error => {
            assert.fail(error);
          });
        });
      } else {
        console.log("Skipping run test because auth.json does not exist.");
      }
    })

  });
})

const defaultConfig = Object.freeze({
  authorization: auth,
});

async function buildApp(config) {
  let app = new StripeApplet();
  return app.processConfig(config || defaultConfig).then(() => {
    return app;
  })
}