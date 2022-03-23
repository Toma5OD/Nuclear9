import { TrackSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

export const infoController = {
    index: {
      handler: async function (request, h) {
        const playlist = await db.playlistStore.getPlaylistById(request.params.id);
        const viewData = {
          title: "Info Page",
          playlist: playlist,
        };
        return h.view("info", viewData);
      },
    },
  };
  