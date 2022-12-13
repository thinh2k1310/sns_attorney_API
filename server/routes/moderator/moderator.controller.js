const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const mailgun = require('../../services/mailgun');

const User = require('../../models/user');

async function getModerators(_, res) {
  try {
    const query = { role: 'ROLE_MODERATOR' };

    const moderators = await User.find(query);

    return res.status(200).json({
      success: true,
      data: moderators
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again. error: ' + error
    });
  }
}

async function createModerator(req, res) {
    try {
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        if (!email) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'You must enter moderator\'s email address.'
                });
        }

        if (!firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'You must enter the moderator\'s full name.'
            });
        }

        const existingUser = await User.findOne({ email: email, verified: true });

        if (existingUser) {
            return res
                .status(200)
                .json({
                    success: false,
                    message: 'This email address is already in use.',
                    isUniqueEmail: false
                });
        }

        const wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
        const password = Array.from(crypto.randomFillSync(new Uint32Array(7)))
                              .map((x) => wishlist[x % wishlist.length])
                              .join('');

        const user = new User({
            email,
            password,
            firstName,
            lastName,
            role: 'ROLE_MODERATOR',
            dob: '01/01/2000',
            verified: true
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);

        user.password = hash;
        const registeredUser = await user.save();

        await mailgun.sendEmail(
            'zaloai097@gmail.com',
            'newModerator',
            {
                email: registeredUser.email,
                password: password,
                firstName: registeredUser.firstName
            }
        );

        return res.status(200).json({
            success: true,
            data: registeredUser,
            message: "Moderator created successfully."
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function deleteModerator(req, res) {
    try {
        const moderatorId = req.params.id;

        const moderator = await User.findById(moderatorId);

        if (!moderator) {
            return res.status(404).json({
                success: false,
                message: 'Moderator not found.'
            });
        }

        await moderator.remove();

        return res.status(200).json({
            success: true,
            data: moderator,
            message: 'Moderator deleted successfully.'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function updateModerator(req, res) {
    try {
        const moderatorId = req.params.id;
        const moderator = await User.findById(moderatorId);

        if (!moderator) {
            return res.status(404).json({
                success: false,
                message: 'Moderator not found.'
            });
        }

        const operator = req.body.op;

        if (operator === 'active') {
            moderator.active = true;
        } else if (operator === 'deactive') {
            moderator.active = false;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Your request could not be processed. Please try again.',
                error: 'Invalid operator.'
            });
        }

        const updatedModerator = await moderator.save();

        return res.status(200).json({
            success: true,
            data: updatedModerator,
            message: 'Moderator updated successfully.'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

module.exports = {
    getModerators,
    createModerator,
    deleteModerator,
    updateModerator
}
