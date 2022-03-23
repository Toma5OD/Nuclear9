export const seedData = {
  users: {
    _model: "User",
    homer: {
      firstName: "Homer",
      lastName: "Simpson",
      email: "homer@simpson.com",
      password: "secret"
    },
    marge: {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: "secret"
    },
    bart: {
      firstName: "Bart",
      lastName: "Simpson",
      email: "bart@simpson.com",
      password: "secret"
    }
  },
  playlists: {
    _model: "Playlist",
    White: {
      title: "White Sands Missile Range, New Mexico",
      lat: 33.6773,
      lng: -106.4754,
      userid: "->users.bart"
    },
    Hiroshima: {
      "title": "Hiroshima",
      "lat": 34.3853,
      "lng": 132.4553,
      "userid": "->users.bart"
    },
    Nagasaki: {
      "title": "Nagasaki",
      "lat": "32.7503",
      "lng": "129.8779",
      "userid": "->users.bart"
    },
    Reggane: {
      "title": "Reggane, Sahara Desert, Algeria",
      "lat": "25.275963",
      "lng": "-1.520862",
      "userid": "->users.bart"
    },
    Novaya: {
      "title": "Novaya Zemlya Island, C.I.S.",
      "lat": "73.61580064",
      "lng": "60.7848987",
      "userid": "->users.bart"
    }
  }
};