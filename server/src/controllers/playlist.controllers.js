import { db } from "../libs/db.js";

export const createPlaylist = async (req, res) => {
  const { name, description } = req.body;

  try {
    const userId = req.user.id;

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.log("Error in creating playlist", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
};

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, message: "" });
  } catch (error) {
    console.log("Error in fetching playlist", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const getPlaylistDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched Successfully",
      playlist,
    });
  } catch (error) {
    console.log("Error in fetching playlist", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemIds" });
    }

    // create records for each problems in the playlist

    const problemsInPlaylist = await db.problemInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId,
        problemId,
      })),
    });

    res.status(201).json({
      success: true,
      message: "Problems added to playlist",
      problemsInPlaylist,
    });
  } catch (error) {
    console.log("Error in adding problem to the playlist", error);
    res.status(500).json({ error: "Failed to add problem to the playlist" });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.log("Error deleting playlist", error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemsId" });
    }

    const deletedProblem = await db.problemsInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
      deletedProblem,
    });
  } catch (error) {
    console.error("Error removing from playlist", error.message);
    res.status(500).json({ error: "Failed to remove problem from playlist" });
  }
};
