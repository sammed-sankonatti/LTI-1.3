// https://stackoverflow.com/questions/73070685/ltijs-deep-linking-hanging-when-sending-back-the-data-to-the-lms




const path = require("path");
const lti = require("ltijs").Provider;

const ltiKey = "myverylongandspecialltikeyfortesting";
toolUrl = "http://192.168.1.25:3010";

// setup provider
lti.setup(ltiKey, {
  url: "mongodb://127.0.0.1:3001/lticlient",
}, {
  // options
  appRoute: "/lti/launch",
  loginRoute: "/lti/login",
  cookies: {
    secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
    sameSite: "None" // set it to "None" if the testing platform is in a different domain and https is being used
  },
  devMode: true, // set it to false when in production and using https,
  keysetRoute: "/lti/keys",
});

// set the lti launch callback
lti.onConnect((token, req, res) => {
  console.log("IDTOKEN", token);
  return res.send("LTI TOOL LAUNCHED!");
});

lti.onDeepLinking((token, req, res) => {
  console.log("DEEP LINKING", token);
  // Call redirect function to deep linking view
  lti.redirect(res, '/deeplink')
})

// GET request to show the selection page
lti.app.get("/deeplink", async (req, res) => {
  res.sendFile(path.join(__dirname, '/public/select.html'))
});

// POST submit from selection page with selected content item
lti.app.post("/deeplink", async (req, res) => {
  const resource = req.body
  const items = [
    {
      type: 'ltiResourceLink',
      title: resource.product,
      url: `${toolUrl}/lti/launch`,
      custom: {
        product: resource.product
      }
    }
  ]

  const form = await lti.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully registered resource!' })
  console.log("RETURNING SELF-SUBMITTING FORM", form);
  return res.send(form);
})

const getPlatforms = () => {
  return [
    {
      url: "http://192.168.1.239",
      name: "MoodleClient1",
      clientId: "client-id-provided-by-Moodle",
      authenticationEndpoint: "http://192.168.1.239/mod/lti/auth.php",
      accesstokenEndpoint: "http://192.168.1.239/mod/lti/token.php",
      authConfig: { method: 'JWK_SET', key: "http://192.168.1.239/mod/lti/certs.php" }
    }
  ];
}

const registerPlatforms = async () => {
  const platforms = getPlatforms();
  platforms.forEach(async (cfg) => {
    console.log(`Registering platform ${cfg.name}`);
    await lti.deletePlatform(cfg.url, cfg.clientId);
    await lti.registerPlatform(cfg);
    const platform = await lti.getPlatform(cfg.url, cfg.clientId);
    await platform.platformActive(true)
  });
}

const setup = async () => {
  await lti.deploy({ port: 3010 });
  registerPlatforms();
  console.log("platforms registered and active");
}
setup();
