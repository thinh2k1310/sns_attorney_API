const Case = require('../../models/case');
const User = require('../../models/user');
const Post = require('../../models/post');


async function sendDefenceRequest(req,res) {
    try {
        const attorney = req.body.attorneyId;
        const post = req.body.postId;
        const customer = req.body.customerId;

        const check = await Case.findOne({
            attorney: attorney,  
            post: post,
            status: "SENT_REQUEST"
        });

        if (check != null) {
            const deletedRequest = await Case.deleteOne({_id : check._id});
            if (deletedRequest != null) {
            return res.status(200).json({
                success: true,
                message: 'Defence request is cancelled',
              });
            }
        }
        
        const request = new Case ({
            attorney,
            post,
            customer
        });
    
        const savedRequest = await request.save();
         if (savedRequest != null) {
            return res.status(200).json({
                success: true,
                message: 'Defence request sent successfully',
                data: savedRequest
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
async function acceptCase(req, res) {
    try {
        const requestId = req.params.requestId;
        const request = await Case.findOneAndUpdate({_id: requestId, status: 'SENT_REQUEST'}, {
            status: 'IN-PROGRESS',
            startingTime: Date.now()
        }, { new : true});
        if (request == null) {
            return res.status(200).json({
                success: false,
                message: "Can not find the defence request",
              });
        }
        await Post.updateOne({_id: request.post}, {isBlock: true});
        await Case.deleteMany({post: request.post, _id : {$ne: request._id}});
        return res.status(200).json({
            success: true,
            message: 'Let\' work together!',
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Your request could not be processed. Please try again.",
          });
    }
}

async function cancelRequest(req, res) {
    try {
        const requestId = req.params.requestId;
        const request = await Case.findOne({_id: requestId, status: 'SENT_REQUEST'});
        if (!request) {
            return res.status(200).json({
                success: false,
                message: "Can not find any case",
              });
        }
        const deletedRequest = await Case.deleteOne({_id : requestId});
        if (deletedRequest != null) {
            return res.status(200).json({
                success: true,
                message: 'Defence request is cancelled',
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

async function getAllDefenceRequests(req, res) {
    try {
        const userId = req.user._id;
        const checkRole = await User.findOne({_id: userId});
        let filter = null;
        if (checkRole.role == "ROLE_ATTORNEY") {
            filter = {attorney : userId.toString(), status : 'SENT_REQUEST'}
        } else {
            filter = {customer : userId.toString(), status : 'SENT_REQUEST'}
        }
        const requests = await Case.find(filter)
                                            .populate({
                                                path: 'attorney',
                                                select: '_id lastName firstName avatar'
                                            })
                                            .populate({
                                                path: 'customer',
                                                select: '_id lastName firstName avatar'
                                            })
                                            .populate({
                                                path: 'post',
                                                select: '_id content user mediaUrl'
                                            })
                                    
        if (requests != null) {
            return res.status(200).json({
                success: true,
                data: requests
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

async function getAllCases(req, res) {
    try {
        const userId = req.user._id;
        const checkRole = await User.findOne({_id: userId});
        let filter = null;
        if (checkRole.role == "ROLE_ATTORNEY") {
            filter = {attorney : userId.toString(), status : { $ne: 'SENT_REQUEST' }}
        } else {
            filter = {customer : userId.toString(), status : { $ne: 'SENT_REQUEST' }}
        }
        const requests = await Case.find(filter)
        .populate({
            path: 'attorney',
            select: '_id lastName firstName avatar'
        })
        .populate({
            path: 'customer',
            select: '_id lastName firstName avatar'
        })
        .populate({
            path: 'post',
            select: '_id content user mediaUrl'
        })

        requests.sort(function(x, y){
            return y.created - x.created;
          })
                                    
        if (requests != null) {
            return res.status(200).json({
                success: true,
                data: requests
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

async function cancelCase(req, res) {
    try {
        const caseId = req.params.caseId;
        const role = req.user.role;
        if (role == "ROLE_USER") {
            await Case.updateOne({_id : caseId}, {
                customerStatus: 'CANCELLED'
            });
        } else if (role == "ROLE_ATTORNEY") {
            await Case.updateOne({_id : caseId}, {
                attorneyStatus: 'CANCELLED'
            });
        } 
         const updatedCase = await Case.updateOne({_id : caseId}, {
            status: 'CANCELLED',
            endingTime: Date.now()
        });
        if (updatedCase != null) {
            return res.status(200).json({
                success: true,
                message: "The case has been cancelled"
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

async function completeCase(req, res) {
    try {
        const caseId = req.params.caseId;
        const role = req.user.role;
        let updatedCase = null;
        if (role == "ROLE_USER") {
            updatedCase = await Case.findOneAndUpdate({_id : caseId}, {
                customerStatus: 'COMPLETED'
            }, {new : true});
        } else if (role == "ROLE_ATTORNEY") {
            updatedCase = await Case.findOneAndUpdate({_id : caseId}, {
                attorneyStatus: 'COMPLETED'
            }, {new : true});
        } 
        if (updatedCase.customerStatus == updatedCase.attorneyStatus) {
            updatedCase = await Case.findOneAndUpdate({_id : caseId}, {
                status: 'COMPLETED',
                endingTime: Date.now()
            }, {new : true});
        }
        if (updatedCase != null) {
            return res.status(200).json({
                success: true,
                message: "The case has been completed"
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

async function getCaseDetail(req,res) {
    try {
        const caseId = req.params.caseId;
        const detailCase = await Case.findOne({ _id: caseId}).populate({
            path: 'attorney',
            select: '_id lastName firstName avatar'
        })
        .populate({
            path: 'customer',
            select: '_id lastName firstName avatar'
        })
        .populate({
            path: 'post',
            select: '_id content user mediaUrl category'
        });


        if (!detailCase) {
            return res.status(200).json({
                success: false,
                message: "Can't find any case match with id"
              });
        }
        return res.status(200).json({
            success: true,
            data: detailCase
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
    sendDefenceRequest,
    acceptCase,
    cancelRequest,
    getAllDefenceRequests,
    getAllCases,
    cancelCase,
    completeCase,
    getCaseDetail
}