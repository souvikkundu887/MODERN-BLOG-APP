var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");
const { FIREBASE_TYPE, FIREBASE_PROJECTID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID, FIREBASE_AUTH_URL, FIREBASE_TOKEN_URL, FIREBASE_AUTH_PROVIDER_x509_CERT_URL, FIREBASE_CLIENT_x509_CERT_URL, FIREBASE_UNIVERSE_DOMAIN } = require("./dotenv.config");

admin.initializeApp({
  credential: admin.credential.cert({
    "type": FIREBASE_TYPE,
    "project_id": FIREBASE_PROJECTID,
    "private_key_id": FIREBASE_PRIVATE_KEY_ID,
    "private_key": FIREBASE_PRIVATE_KEY,
    "client_email": FIREBASE_CLIENT_EMAIL,
    "client_id": FIREBASE_CLIENT_ID,
    "auth_uri": FIREBASE_AUTH_URL,
    "token_uri": FIREBASE_TOKEN_URL,
    "auth_provider_x509_cert_url": FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
    "client_x509_cert_url": FIREBASE_CLIENT_x509_CERT_URL,
    "universe_domain": FIREBASE_UNIVERSE_DOMAIN
  }
  )
});



