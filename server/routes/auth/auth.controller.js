
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
            return res.status(200).json({
                success: false,
                message: 'You must enter an email address.',
            });
        }

        if (!password) {
            return res.status(200).json({
                success: false,
                message: 'You must enter a password.',
            });
        }

        const user = await User.findOne({ email: email, verified: true });
        if (!user) {
            return res
                .status(200)
                .json({
                    success: false,
                    message: 'No user found for this email address.',
                });
        }
        let hash;
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch == false) {
            return res.status(200).json({
                success: false,
                message: 'Incorrect password',
            });
        }

        const payload = {
            id: user.id
        };

        const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

        if (!token) {
            throw new Error('failed to generate login access token');
        }
        return res.status(200).json({
            success: true,
            message: "",
            token: token,
            data: user
        });
    } catch (error) {
        return res.status(400).json({
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
                .status(200)
                .json({
                    success: false,
                    message: 'This email address is already in use.',
                    isUniqueEmail: false
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

        return res.status(200).json({
            success: true,
            message: "Please validate your email"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function validateWithOTP(req, res) {
    try {
        const { email, OTP, isUser } = req.body;
        var validatedUser = await User.findOne(
            {
                email: email,
                verified: false
            })
        if (isUser) {
            validatedUser = await User.findOne(
                {
                    email: email,
                    verified: true
                })
        }
        if (!validatedUser) {
            return res.status(200).json({
                success: false,
                message: 'Your email address is not found.'
            });
        }
        validatedUser = await User.findOne(
            {
                email: email,
                OTP: OTP
            })
        if (!validatedUser) {
            return res.status(200).json({
                success: false,
                message: 'Incorrect OTP. Please try again'
            });
        }else if (validatedUser.OTPExpiredTime < Date.now()) {
            return res.status(200).json({
                success: false,
                message: 'Your OTP is expired. Please attempt to resend new OTP email'
            });
        } else {
            await User.updateOne({ email: email}, { verified: true, OTP: null, OTPExpiredTime: null });
            return res.status(200).json({
                success: true,
                message: `Email has been validated successfully`,
            });
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function sendOTP(req, res) {
    try {
        const { email } = req.body;
        var validatedUser = await User.findOne(
            {
                email: email
            })
        if (!validatedUser) {
            return res.status(200).json({
                success: false,
                message: 'Your email address is not found.'
            });
        }

        const buffer = crypto.randomBytes(3);
        const hex = buffer.toString('hex');
        const OTP = parseInt(hex, 16).toString().slice(0, 6);
        OTPExpiredTime = Date.now() + 300000;
        const updatedUser = await User.updateOne({email: email}, {OTP: OTP, OTPExpiredTime: OTPExpiredTime})
        const user = await User.findOne({ email: email })
        if (!updatedUser) {
            return res.status(200).json({
                success: false,
                message: 'Could not resend you OTP. Please try again later.'
            });
        } else {
            await mailgun.sendEmail(
                user.email,
                'sendOTP',
                user
            );

            return res.status(200).json({
                success: true,
                message: `Please check you email for OTP.`,
            });
        }
    } catch (error) {
        return res.status(400).json({
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
                .status(200)
                .json({
                    success: false,
                    error: 'You must enter an email address.'
                });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res
                .status(200)
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
        await existingUser.save();

        await mailgun.sendEmail(
            existingUser.email,
            'reset',
            existingUser
        );

        return res.status(200).json({
            success: true,
            message: 'Please check your email to reset your password.'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Your request could not be processed. Please try again.'
        });
    }
}

async function resetPassword(req, res) {
    try {
        const email = req.body.email;
        const resetUser = await User.findOne(
            {
                email: email
            });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);

        resetUser.password = hash;

        await resetUser.save();

        await mailgun.sendEmail(resetUser.email, 'reset-confirmation');

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please login with your new password.'
        });
    } catch (error) {
        return res.status(400).json({
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
                .status(200)
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

        return res.status(200).json({
            success: true,
            message:
                'Password changed successfully. Please login with your new password.'
        });
    } catch (error) {
        return tus(400).json({
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
    resetPassword,
    changePassword,
    sendOTP
}
