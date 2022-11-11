//Models and helpers
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');

async function commentPost(req, res) {
    try {
        const userId = req.body.userId;
        const postId = req.body.postId;
        const content = req.body.content;

        const comment = new Comment({
            userId,
            postId,
            content
        });
        const success = await comment.save();
        if (success != null) {
            res.status(200).json({
                success: true,
                data: success
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Your request could not be processed. Please try again.",
        });
    }
}

async function deleteComment(req, res) {
    try {
        const commentId = req.params.id;

        const success = await Comment.deleteOne({_id : commentId});

        if (success != null) {
            res.status(200).json({
                success: true
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Your request could not be processed. Please try again.",
        });
    }
}

async function editComment(req, res) {
    try {
        const commentId = req.body.id;
        const content = req.body.content;

        const success = await Comment.updateOne({_id : commentId} , {content : content});

        if (success != null) {
            res.status(200).json({
                success: true
            });
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
    commentPost,
    editComment,
    deleteComment
}
