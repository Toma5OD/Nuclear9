import { userMemStore } from "./mem/user-mem-store.js";
import { playlistMemStore } from "./mem/playlist-mem-store.js";
import { userJsonStore } from "./json/user-json-store.js";
import { playlistJsonStore } from "./json/playlist-json-store.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { playlistMongoStore } from "./mongo/playlist-mongo-store.js";
import { connectMongo } from "./mongo/connect.js";

export const db = {
  userStore: null,
  playlistStore: null,
  trackStore: null,

  init(storeType) {
    switch (storeType) {
      case "json" :
        this.userStore = userJsonStore;
        this.playlistStore = playlistJsonStore;
        break;
      case "mongo" :
        this.userStore = userMongoStore;
        this.playlistStore = playlistMongoStore;
        connectMongo();
        break;
      default :
        this.userStore = userMemStore;
        this.playlistStore = playlistMemStore;
    }
  }
};
