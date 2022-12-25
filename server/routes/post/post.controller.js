const cloudinary = require('../../services/cloudinary')
const fs = require('fs');
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

const Mongoose = require('mongoose');
//Model 
const Post = require("../../models/post");
const Comment = require('../../models/comment');
const Like = require('../../models/like');
const User = require('../../models/user');


async function createPost(req, res) {
  try {
    const user = req.user._id;
    const content = req.body.content;
    const media = req.files[0];
    const type = req.body.type;
    const category = req.body.category;

    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    let mediaUrl = "";
    let mediaId = "";

    if (media) {
      const { path } = media;
      const newPath = await uploader(path);
      mediaUrl = newPath.url;
      mediaId = newPath.id;
      await unlinkAsync(req.files[0].path);
    }
  

    const post = new Post({
      user,
      content,
      mediaUrl,
      mediaId,
      type,
      category
    });

    const savedPost = await post.save();

    return res.status(200).json({
      success: true,
      message: 'Create post successfully!',
      data: savedPost
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      data: error,
      message: "Your request could not be processed. Please try again.",
    });
  }
}

async function updatePost(req,res) {
  try {
    const postId = req.params.id;
    const content = req.body.content;
    const updatedPost = await Post.updateOne({_id: postId}, { content: content });
    if (!updatedPost) {
      return res.status(200).json({
        success: false,
        message: 'Can not update the post'
      });
    }
    const newPost = await Post.findOne({_id: postId});
    return res.status(200).json({
      success: true,
      message: 'Update post successfully!',
      data: newPost
    });
    
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function deletePost(req,res) {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.deleteOne({_id: postId});
    if (!deletedPost) {
      return res.status(200).json({
        success: false,
        message: 'Can not delete the post'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Delete post successfully!'
    });
    
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getDetailPost(req, res) {
  try {
    const postId = Mongoose.Types.ObjectId(req.params.id);
    const checkPost = await Post.findById(postId);
    const userId = req.user._id;
    if (!checkPost) {
      return res.status(200).json({
        success: false,
        message: "Can't not find any post match with this id"
      });
    }
    const basicQuery = [
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes'
        }
      },
      {
        $addFields: {
          totalLikes: { $size: '$likes' }
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          totalComments: { $size: '$comments' }
        }
      },
      {
        $match: {
          _id: postId
        }
      },
      {
        $addFields: {
          isLikePost: {
            $in: [
              userId,
              '$likes.userId'
            ]
          }
        } 
      },
      {
        $lookup: {
          from: 'cases',
          localField: '_id',
          foreignField: 'post',
          as: 'cases'
        }
      },
      {
        $addFields: {
          isDefendPost: {
            $in: [
              userId,
              '$cases.attorney'
            ]
          }
        } 
      }
      // {
      //   $unwind : '$comments'
      // },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "comments.userId",
      //     foreignField: "_id",
      //     as: "comments.userId"
      //   }
      // },
      // {
      //   $group: {
      //       _id: "$_id",
      //       comments: {$push: "$comments"}
      //   }
      // }
    ];
    const post = await Post.aggregate(basicQuery);
    await Post.populate(post,
      {
        path: 'user',
        select: '_id firstName lastName avatar role',
      });
    await Post.populate(post, 'userId');
    return res.status(200).json({
      success: true,
      data: post[0]
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function fetchNewsFeed(req, res) {
  try {
    let {
      sortOrder,
      type,
      categories,
      pageNumber: page = 1
    } = req.body;

    const pageSize = 10;
    const userId = req.user._id;
    const basicQuery = [
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes'
        }
      },
      {
        $addFields: {
          totalLikes: { $size: '$likes' }
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          totalComments: { $size: '$comments' }
        }
      },
      {
        $addFields: {
          totalReactions: { $sum: ['$totalComments','$totalLikes' ] }
        }
      },
      {
        $addFields: {
          isLikePost: {
            $in: [
              userId,
              '$likes.userId'
            ]
          }
        } 
      },
      {
        $lookup: {
          from: 'cases',
          localField: '_id',
          foreignField: 'post',
          as: 'cases'
        }
      },
      {
        $addFields: {
          isDefendPost: {
            $in: [
              userId,
              '$cases.attorney'
            ]
          }
        } 
      }
    ];

    if (type != null) {
      basicQuery.push({
        $match: {
          type: type
        }
      });
    }

    if (categories != null) {
      basicQuery.push({
        $match : { category : {
          $in: categories
        }
      }
      });
    }
    let posts = null;
    let postsCount = 0;
    if (page == -1) {
      postsCount = await Post.aggregate(basicQuery);
      const paginateQuery = [
        { $sort: sortOrder },
        { $skip: pageSize * (postsCount.length > 10 ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      posts = await Post.aggregate(basicQuery.concat(paginateQuery));
      await Post.populate(posts,
        {
          path: 'user',
          select: '_id firstName lastName avatar role',
        });
    } else {
      postsCount = await Post.aggregate(basicQuery);
      const paginateQuery = [
        { $sort: sortOrder },
        { $skip: pageSize * (postsCount.length > pageSize ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      posts = await Post.aggregate(basicQuery.concat(paginateQuery));
      await Post.populate(posts,
        {
          path: 'user',
          select: '_id firstName lastName avatar role',
        });
    } 
    return res.status(200).json({
      success: true,
      metadata: {
        total: postsCount.length,
        page,
        pages: postsCount.length > 0 ? Math.ceil(postsCount.length / pageSize) : 0
      },
      data: posts
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getPostComments(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const comments = await Comment.find({ postId: postId }).populate({
      path: 'userId',
      select: '_id lastName firstName avatar'
    }).populate({
      path: 'postId',
      select: '_id user'
    })

    comments.sort(function(x, y){
      return x.created - y.created;
    }).sort(function(x){
      return x.userId._id == userId;
    })
    return res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function fetchUserPosts(req, res) {
  try {
    let {
      profileId,
      pageNumber: page = 1
    } = req.body;

    const pageSize = 10;
    const userId = req.user._id;
    const profile =  Mongoose.Types.ObjectId(profileId);
    const basicQuery = [
      {
        $match: {
          user: profile
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes'
        }
      },
      {
        $addFields: {
          totalLikes: { $size: '$likes' }
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          totalComments: { $size: '$comments' }
        }
      },
      {
        $addFields: {
          totalReactions: { $sum: ['$totalComments','$totalLikes' ] }
        }
      },
      {
        $addFields: {
          isLikePost: {
            $in: [
              userId,
              '$likes.userId'
            ]
          }
        } 
      },
      {
        $lookup: {
          from: 'cases',
          localField: '_id',
          foreignField: 'post',
          as: 'cases'
        }
      },
      {
        $addFields: {
          isDefendPost: {
            $in: [
              userId,
              '$cases.attorney'
            ]
          }
        } 
      }
    ];

    let posts = null;
    let postsCount = 0;
    if (page == -1) {
      postsCount = await Post.aggregate(basicQuery);
      const paginateQuery = [
        { $sort: sortOrder },
        { $skip: pageSize * (postsCount.length > 10 ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      posts = await Post.aggregate(basicQuery.concat(paginateQuery));
      await Post.populate(posts,
        {
          path: 'user',
          select: '_id firstName lastName avatar role',
        });
    } else {
      postsCount = await Post.aggregate(basicQuery);
      const paginateQuery = [
        { $sort: {created: - 1} },
        { $skip: pageSize * (postsCount.length > pageSize ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      posts = await Post.aggregate(basicQuery.concat(paginateQuery));
      await Post.populate(posts,
        {
          path: 'user',
          select: '_id firstName lastName avatar role',
        });
    } 
    return res.status(200).json({
      success: true,
      metadata: {
        total: postsCount.length,
        page,
        pages: postsCount.length > 0 ? Math.ceil(postsCount.length / pageSize) : 0
      },
      data: posts
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

async function summaryPosts(_, res) {
  try {
    const posts = await Post.find();
    var seventhDay = new Date();
    seventhDay.setDate(seventhDay.getDate() - 7);
    var filteredData = posts.filter((post) => {
      return new Date(post.created).getTime() >= seventhDay.getTime();
    });
    var daysSorted = [];

    for(var i = 0; i < 7; i++) {
      var today = new Date();
      var newDate = new Date(today.setDate(today.getDate() - i));
      var month = newDate.getUTCMonth(); //months from 1-12
      var day = newDate.getUTCDate();
      var year = newDate.getUTCFullYear();
      const date = day + "/" + month + "/" + year;
      daysSorted.push(date);
    }
    daysSorted.reverse();

    let groups = daysSorted.reduce((groups, day) => {
      groups[day] = 10;
      return groups;
    }, {});
    if (filteredData.length){
      groups = filteredData.reduce((_, post) => {
        const postDate = post.created;
        var month = postDate.getUTCMonth();
        var day = postDate.getUTCDate();
        var year = postDate.getUTCFullYear();
        const date = day + "/" + month + "/" + year;
        groups[date] =  groups[date] + 1;
        return groups;
      }, {});
    }
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        count: groups[date]
      };
    });
    return res.status(200).json({
      success: true,
      data: groupArrays
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}

module.exports = {
  createPost,
  getDetailPost,
  fetchNewsFeed,
  getPostComments,
  deletePost,
  updatePost,
  fetchUserPosts,
  summaryPosts
};
