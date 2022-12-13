//Models and helpers
const User = require('../../models/user');
const Post = require('../../models/post');
const CaseComment = require('../../models/caseComment');

async function commentCase(req, res) {
    try {
        const userId = req.body.userId;
        const caseId = req.body.caseId;
        const content = req.body.content;

        const comment = new CaseComment({
            userId,
            caseId,
            content
        });
        const success = await comment.save();
        if (success != null) {
            return res.status(200).json({
                success: true,
                data: success
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Your request could not be processed. Please try again.",
        });
    }
}

async function deleteComment(req, res) {
    try {
        const commentId = req.params.id;

        const success = await CaseComment.deleteOne({_id : commentId});

        if (!success) {
            return res.status(200).json({
                success: false,
                message: "Can not delete the comment"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Delete the comment successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Your request could not be processed. Please try again.",
        });
    }
}

module.exports = {
    commentCase,
    deleteComment
}
