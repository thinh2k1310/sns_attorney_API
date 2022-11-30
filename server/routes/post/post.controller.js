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

    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    let mediaUrl = "";
    let mediaId = "";

    if (media) {
      const { path } = media;
      const newPath = await uploader(path);
      mediaUrl = newPath.url;
      mediaId = newPath.id;
    }
    await unlinkAsync(req.files[0].path);

    const post = new Post({
      user,
      content,
      mediaUrl,
      mediaId,
      type
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
      pageNumber: page = 1
    } = req.body;

    const pageSize = 10;
    const typeFilter = type ? { type } : {};
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

module.exports = {
  createPost,
  getDetailPost,
  fetchNewsFeed,
  getPostComments,
  deletePost,
  updatePost
};
