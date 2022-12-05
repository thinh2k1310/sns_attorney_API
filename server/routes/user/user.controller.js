
const User = require('../../models/user');

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


module.exports = {
    getProfile,
    updateUserProfile
}
