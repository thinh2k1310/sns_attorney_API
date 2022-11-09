const Post = require("../../models/post");

async function createPost(req, res) {
  try {
    const user = req.user._id;
    const content = req.body.content;
    const image = req.files[0];
    const type = req.body.type;

    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    let imageUrl = "";
    let imageId = "";

    if (image) {
      const { path } = image;
      const newPath = await uploader(path);
      imageUrl = newPath.url;
      imageId = newPath.id;
    }
    await unlinkAsync(req.files[0].path);

    const post = new Post ({
        user,
        content,
        imageUrl,
        imageId,
        type,
        created
    });

    const savedPost = await post.save();

      res.status(200).json({
        success: true,
        message: 'Product has been added successfully!',
        data: savedPost
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
}

module.exports = {
  createPost,
};
