const cloudinary = require('../../services/cloudinary')
const fs = require('fs');
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink) 
const User = require('../../models/user');
const keys = require('../../configs/keys');

async function getAllUsers(_ , res){
  try {
    const users = await User.find();
    const groupUsers = {};
    for (const user of users) {
      switch (user.role) {
        case 'ROLE_USER':
          groupUsers['User'] = groupUsers['User'] ? groupUsers['User'] + 1 : 1;
          break;
        case 'ROLE_ATTORNEY':
          groupUsers['Attorney'] = groupUsers['Attorney'] ? groupUsers['Attorney'] + 1 : 1;
          break;
        default:
          groupUsers['Admin'] = groupUsers['Admin'] ? groupUsers['Admin'] + 1 : 1;
          break;
      }
    }
    return res.status(200).json({
      success: true,
      data: {
      key: Object.keys(groupUsers),
      value: Object.values(groupUsers)
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function updateUserProfile(req, res){
  try {
    const userId = req.user._id;
    const update = req.body;
    const query = { _id: userId };

    const userDoc = await User.findOneAndUpdate(query, update, {
      new: true
    });

    return res.status(200).json({
      success: true,
      message: 'Your profile is successfully updated!',
      data: userDoc
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again. error: ' + error
    });
  }
}

async function getProfile(req, res){
    try {
      const userId = req.params.id;
      const userDoc = await User.findById(userId);
  
      return res.status(200).json({
        success: true,
        data: userDoc
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }

  async function updateCover(req, res) {
    try {
      const user = req.user._id;
      const media = req.files[0];
  
      const uploader = async (path) => await cloudinary.uploads(path, "Images");
  
      let cover = "";
  
      if (media) {
        const { path } = media;
        const newPath = await uploader(path);
        cover = newPath.url;
        await unlinkAsync(req.files[0].path);
      }
    const updatedUser = await User.findOneAndUpdate({_id: user}, {cover: cover}, {new: true});
  
      return res.status(200).json({
        success: true,
        message: 'Change cover successfully!',
        data: updatedUser
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: "Your request could not be processed. Please try again.",
      });
    }
  } 

  async function updateAvatar(req, res) {
    try {
      const user = req.user._id;
      const media = req.files[0];
  
      const uploader = async (path) => await cloudinary.uploads(path, "Images");
  
      let avatar = "";
  
      if (media) {
        const { path } = media;
        const newPath = await uploader(path);
        avatar = newPath.url;
        await unlinkAsync(req.files[0].path);
      }
    const updatedUser = await User.findOneAndUpdate({_id: user}, {avatar: avatar}, {new: true});
  
      return res.status(200).json({
        success: true,
        message: 'Change avatar successfully!',
        data: updatedUser
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: "Your request could not be processed. Please try again.",
      });
    }
  }

  async function blockUser(req, res) {
    try {
      const userId = req.params.id;
      const query = { _id: userId };

      const userDoc = await User.findOneAndUpdate(query, {active: false});

      return res.status(200).json({
        success: true,
        message: 'User is blocked!',
        data: userDoc
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        success: false,
        message: 'Your request could not be processed. Please try again. error: ' + error
      });
    }
  }

  async function getAllBlockUser(req, res) {
    try {
      const blockUsers = await User.find({ active: false, role: {$ne: 'ROLE_MODERATOR'}});
      return res.status(200).json({
        success: true,
        data: blockUsers
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        success: false,
        message: 'Your request could not be processed. Please try again. error: ' + error
      });
    }
  }

  async function unBlockUser(req, res) {
    try {
      const userId = req.params.id;
      const query = { _id: userId };

      const userDoc = await User.findOneAndUpdate(query, {active: true});

      return res.status(200).json({
        success: true,
        message: 'User is unblocked!',
        data: userDoc
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        success: false,
        message: 'Your request could not be processed. Please try again. error: ' + error
      });
    }
  }

module.exports = {
    getProfile,
    updateUserProfile,
    updateCover,
    updateAvatar,
    blockUser,
    getAllUsers,
    getAllBlockUser,
    unBlockUser
}
