const admin = require('firebase-admin');
require('dotenv').config().parsed;

// Fetch the service account key JSON file contents
const serviceAccount = require('./telegraph-bot-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.CHAT_APP_DB_URL,
  databaseAuthVariableOverride: null,
});


const db = admin.database();
const dbRef = db.ref();

function addUserData(uid, username, first_name) {
  db.ref(`users/${uid}`).set({
    uid,
    username,
    first_name,
    budget: 0,
    costs: {
      Home: 0,
      Family: 0,
      Travels: 0,
      Food: 0,
      Entertainment: 0,
      Other: 0,
    },
    data: new Date().toJSON(),
  });
}

const addNum = (uid, num) => dbRef.child('users').child(uid).get().then((snapshot) => {
  if (snapshot.exists()) {
    let { budget } = snapshot.val();
    budget += num;
    db.ref(`users/${uid}`).update({ budget });
  } else {
    console.log('No data available');
  }
})
  .catch((error) => {
    console.error(error);
  });
const reduceNum = (uid, num) => dbRef.child('users').child(uid).get().then((snapshot) => {
  if (snapshot.exists()) {
    let { budget } = snapshot.val();
    budget -= num;
    if (budget >= 0) {
      db.ref(`users/${uid}`).update({ budget });
      return true;
    } return false;
  }
  console.log('No data available');
})
  .catch((error) => {
    console.error(error);
  });

const balance = (uid) => dbRef.child('users').child(uid).get().then((snapshot) => {
  if (snapshot.exists()) {
    return snapshot.val().budget;
  }
  console.log('No data available');
})
  .catch((error) => {
    console.error(error);
  });

const addCosts = (uid, num, category) => dbRef.child('users').child(uid).child('costs').get()
  .then((snapshot) => {
    if (snapshot.exists()) {
      const costs = snapshot.val();
      costs[category] = snapshot.val()[category] + num;
      db.ref(`users/${uid}/`).update({ costs });
    } else {
      console.log('No data available');
    }
  })
  .catch((error) => {
    console.error(error);
  });

const allCosts = (uid) => dbRef.child('users').child(uid).child('costs').get()
  .then((snapshot) => {
    if (snapshot.exists()) {
      const costs = snapshot.val();
      return costs;
    }
    console.log('No data available');
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = {
  addUserData, addNum, reduceNum, balance, addCosts, allCosts,
};
// dbRef.child("users").get().then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log(snapshot.val());
//   } else {
//     console.log("No data available");
//   }
// }).catch((error) => {
//   console.error(error);
// }); // функция получения всех юзеров

// dbRef.child("users").child(uid).get().then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log(snapshot.val());
//   } else {
//     console.log("No data available");
//   }
// }).catch((error) => {
//   console.error(error);
// }); //почти тоже самое но с уид
