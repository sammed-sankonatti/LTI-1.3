const express = require("express")
const app = express()
const path = require("path")
const LTI = require("ltijs").Provider

LTI.setup("12345", {
    url : 'mongodb://localhost:27017/lti-lms'
    },
    {
        staticPath : path.join(__dirname, './public'),
        appUrl : "/launch",
        loginUrl : "/login",
        keysetUrl : "/keyset",
        
        
        cookies : {
            secure : true,
            sameSite : 'None'
        }, 
    },
)

LTI.onConnect((connection, req, res, next)=> {
    console.log(req.token);
    res.redirect('http://localhost:5173')   // the location where your frontend is running
})


const setup = async () => {
    // Deploy server and open connection to the database
    await LTI.deploy({ port : 3000 }) // Specifying port. Defaults to 3000
  
    // // Register platform
    const auth = await LTI.registerPlatform({
      url: 'https://moodle.appmocx.com',
      name: 'moodle',
      clientId: 'VQfobQZ4TndZAP0',
      authenticationEndpoint: 'https://moodle.appmocx.com/mod/lti/auth.php',
      accesstokenEndpoint: 'https://moodle.appmocx.com/mod/lti/token.php',
      authConfig: { method: 'JWK_SET', key: 'https://moodle.appmocx.com/mod/lti/certs.php' }
    })

    app.use(express.json())
    // app.use("/lti", LTI.app)

    app.listen(8080, ()=> {
        console.log("started");
    })
  }

  setup()