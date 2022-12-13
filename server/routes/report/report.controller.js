const Report = require('../../models/report');
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');

async function report(req,res) {
    try {
        const reportingUser = req.body.reportingUser;
        const reportedUser = req.body.reportedUser;
        const type = req.body.type;
        const post = req.body.post;
        const comment = req.body.comment;
        const problem = req.body.problem;
        let report ;
        if (type == "Comment") {
            report = new Report({
                reportingUser,
                reportedUser,
                type,
                comment,
                problem
            })
        } else if (type == "Post") {
            report = new Report({
                reportingUser,
                reportedUser,
                type,
                post,
                problem
            })
        }
        const savedReport = await report.save();
        if (savedReport != null) {
            return res.status(200).json({
                success: true,
                message: 'Send report successfully!',
                data: savedReport
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

async function deleteUserReport(req, res) {
    try {
        const reportedUser = req.params.id;

        const deletedReports = await Report.deleteMany({reportedUser: reportedUser});

        if (deletedReports != null) {
            return res.status(200).json({
                success: true,
                message: 'Delete reports successfully!'
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

async function getAllReport(req, res) {
    try {
        const reports = await Report.find().populate({
            path: 'post',
            select: '_id content mediaUrl'
        }).populate({
            path: 'comment',
            select: '_id content'
        }).populate({
            path: 'reportedUser',
            select: '_id lastName firstName avatar'
        });

        if (reports != null) {
            return res.status(200).json({
                success: true,
                data: reports
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

async function getAllUserReport(req, res) {
    try {
        const reportedUser = req.params.id;
        const reports = await Report.find({reportedUser: reportedUser}).populate({
            path: 'post',
            select: '_id content mediaUrl'
        }).populate({
            path: 'comment',
            select: '_id content'
        }).populate({
            path: 'reportedUser',
            select: '_id lastName firstName avatar'
        });;

        if (reports != null) {
            return res.status(200).json({
                success: true,
                data: reports
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

module.exports = {
    report,
    getAllReport,
    getAllUserReport,
    deleteUserReport
}