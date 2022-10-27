
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



// Bring in models and helpers
const User = require('../../models/user')
const mailgun = require('../../services/mailgun');
const template = require('../../services/template');
const keys = require('../../configs/keys');


const { secret, tokenLife } = keys.jwt;

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'You must enter an email address.',
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'You must enter a password.',
            });
        }

        const user = await User.findOne({ email: email, verified: true });
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'No user found for this email address.',
                });
        }
        let hash;
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch == false) {
            return res.status(400).json({
                success: false,
                message: 'Password incorrect',
            });
        }

        const payload = {
            id: user.id
        };

        const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

        if (!token) {
            throw new Error('failed to generate login access token');
        }
        res.status(200).json({
            success: true,
            message: "",
            token: token,
            data: user
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function register(req, res) {
    try {
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const password = req.body.password;
        const dob = req.body.dob;
        const role = req.body.role;
        if (!email) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'You must enter an email address.'
                });
        }

        if (!firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: 'You must enter your full name.'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'You must enter a password.'
            });
        }

        if (!dob) {
            return res.status(400).json({
                success: false,
                error: 'You must enter your date of birth.'
            });
        }

        if (!role) {
            return res.status(400).json({
                success: false,
                error: 'You must choose a role.'
            });
        }

        const existingUser = await User.findOne({ email: email, verified: true });

        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'This email address is already in use.'
                });
        }


        const buffer = crypto.randomBytes(3);
        const hex = buffer.toString('hex');
        const OTP = parseInt(hex, 16).toString().slice(0, 6);
        OTPExpiredTime = Date.now() + 300000;

        const user = new User({
            email,
            password,
            firstName,
            lastName,
            dob,
            OTP,
            OTPExpiredTime
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);

        user.password = hash;
        const registeredUser = await user.save();

        const payload = {
            id: registeredUser.id
        };

        await mailgun.sendEmail(
            registeredUser.email,
            'validate',
            registeredUser
        );

        res.status(200).json({
            success: true,
            message: "Please validate your email"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function validateWithOTP(req, res) {
    try {
        const { email, OTP } = req.body;
        var validatedUser = await User.findOne(
            {
                email: email,
                verified: false
            })
        if (!validatedUser) {
            return res.status(400).json({
                success: false,
                message: 'Your email address is not found.'
            });
        }
        validatedUser = await User.findOne(
            {
                email: email,
                OTP: OTP,
                OTPExpiredTime: { $gt: Date.now() },
                verified: false
            })
        if (!validatedUser) {
            return res.status(422).json({
                success: false,
                message: 'Your token has expired. Please attempt to reset your password again.'
            });
        } else {
            await User.findOneAndUpdate({ email: email }, { verified: true, OTP: undefined, OTPExpiredTime: undefined }, {
                new: true
            });
            res.status(200).json({
                success: true,
                message: `Email has been validated successfully`,
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res
                .status(400)
                .json({
                    success: false,
                    error: 'You must enter an email address.'
                });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'No user found for this email address.'
                });
        }

        const buffer = crypto.randomBytes(3);
        const hex = buffer.toString('hex');
        const OTP = parseInt(hex, 16).toString().slice(0, 6);

        existingUser.OTP = OTP;
        existingUser.OTPExpiredTime = Date.now() + 300000;
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        console.log(today.toISOString());
        await existingUser.save();

        await mailgun.sendEmail(
            existingUser.email,
            'reset',
            existingUser
        );

        res.status(200).json({
            success: true,
            message: 'Please check your email to reset your password.'
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function resetPasswordWithOTP(req, res) {
    try {
        const OTP = req.body.OTP;
        console.log(OTP);
        const resetUser = await User.findOne(
            {
                OTP: OTP,
                OTPExpiredTime: { $gt: Date.now() }
            })
        if (!resetUser) {
            return res.status(422).json({
                success: false,
                message: 'Your OTP has expired. Please attempt to resend yout OTP again.'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);

        resetUser.password = hash;
        resetUser.OTP = undefined;
        resetUser.OTPExpiredTime = undefined;

        await resetUser.save();

        await mailgun.sendEmail(resetUser.email, 'reset-confirmation');

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please login with your new password.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function changePassword(req, res) {
    try {
        const { password, newPassword } = req.body;
        const email = req.user.email;

        if (!email) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'You must enter a password.'
            });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'No user found with this email address.'
                });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'Please enter your correct old password.'
                });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        existingUser.password = hash;
        existingUser.save();

        await mailgun.sendEmail(existingUser.email, 'reset-confirmation');

        res.status(200).json({
            success: true,
            message:
                'Password changed successfully. Please login with your new password.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}


module.exports = {
    login,
    register,
    validateWithOTP,
    forgotPassword,
    resetPasswordWithOTP,
    changePassword
}
