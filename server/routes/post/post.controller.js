const cloudinary = require('../../services/cloudinary')
const fs = require('fs');
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

const Mongoose = require('mongoose');
//Model 
const Post = require("../../models/post");


async function createPost(req, res) {
  try {
    const user = req.user._id;
    const content = req.body.content;
    const media = req.files[0];
    const type = req.body.type;

    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    let mediaUrl = "";
    let mediaId = "";

    if (media) {
      const { path } = media;
      const newPath = await uploader(path);
      mediaUrl = newPath.url;
      mediaId = newPath.id;
    }
    await unlinkAsync(req.files[0].path);

    const post = new Post ({
        user,
        content,
        mediaUrl,
        mediaId,
        type
    });

    const savedPost = await post.save();

      res.status(200).json({
        success: true,
        message: 'Create post successfully!',
        data: savedPost
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
}

module.exports = {
  createPost,
};
