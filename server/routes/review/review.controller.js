
const Mongoose = require('mongoose');
//Model 
const Review = require("../../models/review");
const Case = require('../../models/case');
const User = require('../../models/user');

async function reviewCase (req, res) {
    try {
        const cases = req.body.cases;
        const point = req.body.point;
        const content = req.body.content;

        const checkCase = await Case.findOne({ _id: cases});

        if (checkCase.isReviewed) {
            return res.status(200).json({
                success: false,
                message: 'Already review this case'
              });
        }

        const client = checkCase.customer;
        const attorney = checkCase.attorney;

        const review = new Review({
            client,
            attorney,
            cases,
            point,
            content
          });
      
        const savedReview = await review.save();
        if (savedReview != null) {
            const newCase = await Case.findOneAndUpdate({ _id: cases}, {isReviewed : true}, {new: true});
            return res.status(200).json({
                success: true,
                message: 'Add review successfully!',
                data: savedReview
              });
        }
    } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
    }
}

async function getAllReviews(req,res) {
    try {
        const attorney = req.params.userId;

        const reviews = await  Review.find({attorney: attorney}).populate({
            path: 'client',
            select: '_id lastName firstName avatar'
        });
        let sum = 0;
        function myFunction(value, index, array) {
            sum += value.point;
        }   
        reviews.forEach(myFunction);
        reviews.sort(function(x, y){
            return y.created - x.created;
          })

        return res.status(200).json({
            success: true,
            total: reviews.length,
            rating: sum/reviews.length,
            reviews: reviews
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Your request could not be processed. Please try again.",
          });
    }
}

module.exports = { 
    reviewCase,
    getAllReviews
}