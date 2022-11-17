const FriendRequest = require('../../models/friendRequest');


// FriendRequest

async function sendFriendRequest(req,res) {
    try {
        const requestingUser = req.body.requestingUser;
        const requestedUser = req.body.requestedUser;

        const check = await FriendRequest.findOne({
            requestingUser: requestingUser,  
            requestedUser: requestedUser
        });

        if (check != null) {
            return res.status(200).json({
                success: false,
                message: 'Friend request already sent before',
              });
              return;
        }
        
        const request = new FriendRequest ({
            requestedUser,
            requestingUser
        });
    
        const savedRequest = await request.save();
         if (savedRequest != null) {
            return res.status(200).json({
                success: true,
                message: 'Friend request sent successfully',
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
async function acceptRequest(req, res) {
    try {
        const requestId = req.params.requestId;
        const request = await FriendRequest.findOneAndUpdate({_id: requestId}, {
            status: 'FRIEND',
            beFriendTime: Date.now()
        });
        if (!request) {
            return res.status(200).json({
                success: false,
                message: "Can not find the friend request",
              });
        }
            return res.status(200).json({
                success: true,
                message: 'You guys are friend now!',
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
        const request = await FriendRequest.findOne({_id: requestId});
        if (!request) {
            return res.status(200).json({
                success: false,
                message: "Can not find the friend request",
              });
        }
        const deletedRequest = await FriendRequest.deleteOne({_id : requestId});
        if (deletedRequest != null) {
            return res.status(200).json({
                success: true,
                message: 'Friend request is cancelled',
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

async function getAllFriendRequests(req, res) {
    try {
        const userId = req.user._id;
        const requests = await FriendRequest.find({requestedUser : userId})
                                            .populate({
                                                path: 'requestingUser',
                                                select: '_id lastName firstName avatar'
                                            });

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

async function cancelFriendShip(req, res) {
    try {
        const friendShipId = req.params.friendShipId;
        const deletedFS = await FriendShip.deleteOne({_id : friendShipId});
        if (deletedFS != null) {
            return res.status(200).json({
                success: true,
                data: deletedFS
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
    sendFriendRequest,
    acceptRequest,
    cancelRequest,
    getAllFriendRequests,
    cancelFriendShip
}