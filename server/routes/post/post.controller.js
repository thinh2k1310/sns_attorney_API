const cloudinary = require('../../services/cloudinary')
const fs = require('fs');
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)

const Mongoose = require('mongoose');
//Model 
const Post = require("../../models/post");
const Comments = require('../../models/comment');
const Likes = require('../../models/like');


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

    const post = new Post ({
        user,
        content,
        mediaUrl,
        mediaId,
        type
    });

    const savedPost = await post.save();

      res.status(200).json({
        success: true,
        message: 'Create post successfully!',
        data: savedPost
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
}

async function getDetailPost(req, res) {
  try {
    const postId = req.params.id;
    const post = await Post.findById({_id: postId});
    if (!post) {
      return res.status(404).json({
        success : false,
        message: 'Can\'t find post with the id'
      });
    }
    res.status(200).json({
      success : true,
      data : post
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Your request could not be processed. Please try again.",
    });
  }
}

async function fetchNewsFeed(req, res){
  try {
    let {
      sortOrder,
      type,
      pageNumber: page = 1
    } = req.body;

    const pageSize = 10;
    const typeFilter = type ? { type } : {};
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
        $project: {
          reviews: 0
        }
      }
    ];

    let postType = null;
    if(type != null ){
    
    postType = await Post.find({type : type});
    const ids = [];
    postType.forEach(post => {
     ids.push(post._id)
   });
      basicQuery.push({
        $match: {
          _id: {
            $in: Array.from(ids)
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
      await Post.populate( posts, 
                        {
                          path: 'user',
                          select : '_id firstName lastName avatar role',
                        });
    } else {
      postsCount = await Post.aggregate(basicQuery);
      const paginateQuery = [
        { $sort: sortOrder },
        { $skip: pageSize * (postsCount.length > 8 ? page - 1 : 0) },
        { $limit: pageSize }
      ];
      posts = await Post.aggregate(basicQuery.concat(paginateQuery));
      await Post.populate( posts, 
        {
          path: 'user',
          select : '_id firstName lastName avatar role',
        });
    }

    res.status(200).json({
      success : true,
      data : {
      posts,
      totalPosts: postsCount.length,
      page,
      pages: postsCount.length > 0 ? Math.ceil(postsCount.length / pageSize) : 0
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

module.exports = {
  createPost,
  getDetailPost,
  fetchNewsFeed
};
