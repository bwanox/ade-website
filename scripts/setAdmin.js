const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json"); // your service account JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with the UID of the user you want to make a club rep
const uid = "G0dUCLHqsQRQN7xRMDJN0wfMz6K2";

// Set custom claims for a club rep
admin.auth().setCustomUserClaims(uid, { 
  role: "club_rep",
  clubId: "9FJ7EiFI3qWxFcCidV7x" // the ID of the club this user manages
})
.then(() => console.log("User is now a club rep"))
.catch(console.error);
