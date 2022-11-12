const Post = require("../../models/post");
const Comment = require('../../models/comment');
const Like = require('../../models/like');
const User = require('../../models/user');

async function searchAll(req, res){
    try {
      let {
        searchText,
        pageNumber: page = 1
      } = req.body;
  
      const pageSize = 5;
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
          $match : {
            content : {$regex : `${searchText}`, $options: 'i'}
          }
        }
      ];

      let posts = null;
      let users = null;
      if (page == -1) {
        postsCount = await Post.aggregate(basicQuery);
        const paginateQuery = [
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
          { $limit: pageSize }
        ];
        posts = await Post.aggregate(basicQuery.concat(paginateQuery));
        await Post.populate( posts, 
          {
            path: 'user',
            select : '_id firstName lastName avatar role',
          });
        users = await User.find({$or: [ {firstName : {$regex : `${searchText}`, $options: 'i'} }, {lastName : {$regex : `${searchText}`, $options: 'i'}} ] }).limit(pageSize);
      }
  
      res.status(200).json({
        success : true,
        data : {
        posts,
        users
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
  
  async function searchPost(req, res){
    try {
      let {
        sortOrder,
        type,
        searchText,
        pageNumber: page = 1
      } = req.body;
  
      const pageSize = 10;
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
          $match : {
            content : {$regex : `${searchText}`, $options: 'i'}
          }
        }
      ];
  
      if(type != null ){
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
          { $skip: pageSize * (postsCount.length > pageSize ? page - 1 : 0) },
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
          { $skip: pageSize * (postsCount.length > pageSize ? page - 1 : 0) },
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
  
  async function searchUser(req, res){
    try {
      let {
        role,
        searchText,
        pageNumber: page = 1
      } = req.body;
  
      const pageSize = 10;
      const basicQuery = [
        // {
        //   $lookup: {
        //     from: 'likes',
        //     localField: '_id',
        //     foreignField: 'postId',
        //     as: 'likes'
        //   }
        // },
        // {
        //   $addFields: {
        //     totalLikes: { $size: '$likes' }
        //   }
        // },
        {
          $match : {
            $or: [ {firstName : {$regex : `${searchText}`, $options: 'i'} }, 
                  {lastName : {$regex : `${searchText}`, $options: 'i'}} ] 
            }
        }
      ];
  
      if(role != null){
        basicQuery.push({
          $match: {
            role: role
          }
        });
     }
      let users = null;
      let usersCount = 0;
      if (page == -1) {
        usersCount = await Post.aggregate(basicQuery);
        const paginateQuery = [
          { $skip: pageSize * (usersCount.length > pageSize ? page - 1 : 0) },
          { $limit: pageSize }
        ];
        users = await User.aggregate(basicQuery.concat(paginateQuery));
      } else {
        usersCount = await User.aggregate(basicQuery);
        const paginateQuery = [
          { $skip: pageSize * (usersCount.length > pageSize ? page - 1 : 0) },
          { $limit: pageSize }
        ];
        users = await User.aggregate(basicQuery.concat(paginateQuery));
      }
      res.status(200).json({
        success : true,
        data : {
        users,
        totalUsers: usersCount.length,
        page,
        pages: usersCount.length > 0 ? Math.ceil(usersCount.length / pageSize) : 0
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
    searchAll,
    searchPost,
    searchUser
  }