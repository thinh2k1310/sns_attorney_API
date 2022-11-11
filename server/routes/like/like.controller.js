//Models and helpers
const User = require('../../models/user');
const Post = require('../../models/post');
const Like = require('../../models/like');

async function likePost(req, res) {
    try {
        const userId = req.body.userId;
        const postId = req.body.postId;
        
        const isLiked = await Like.findOne({userId: userId, postId: postId}); 
        
        if (!isLiked) {
            const like = new Like ({
                userId,
                postId
            });
            const success = await like.save();
            if (success != null) {
                res.status(200).json({
                    success: true,
                    data: {like : true}
                  });
            }
        } else {
            const success = await Like.deleteOne({ _id: isLiked._id});
            if (success != null) {
                res.status(200).json({
                    success: true,
                    data: {like : false}
                  });
            }
        }
    } catch (error) {
      console.log(error);
      res.status(400).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
    }
}

module.exports = {
    likePost
}
