var express = require('express');
var router = express.Router();
//引入用户模块
var User = require('../models/User');
var Content = require('../models/Content');

//统一的反馈格式
var responseData;
//在router模块被用到时初始化
router.use( function (req,res,next) {
    //对回复内容初始化
    responseData = {
        code: 0,
        message: ''
    };

    next();
});

/*
* 用户注册
*   注册逻辑
*
*   1.用户名不能为空
*   2.密码不能为空
*   3.两次输入密码必须一致
*
*   数据库
*   1.用户是否已被注册
*       数据库查询
*
* */
router.post('/user/register',function (req,res,next) {

    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户名是否为空
    if ( username == '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        //将对象转为json格式并返回给前端
        res.json(responseData);
        return;
    }
    //密码不能为空
    if ( password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    //两次输入的密码必须一致
    if ( password != repassword) {
        responseData.code = 3;
        responseData.message = '密码不一致';
        res.json(responseData);
        return;
    }

    //用户名是否已经被注册了：如果数据库中已存在用户名同名数据，表示该用户名已经被注册了
    User.findOne({
        username: username
    }).then(function ( userInfo ) {
        if (userInfo) {
            //表示数据库中有该记录、
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return Promise.reject();
        }
        //保存用户注册的信息到数据库中
        var user = new User({
            username: username,
            password: password
            });
        return user.save();
    }).then(function (newUserInfo) {
        //console.log(newUserInfo);
        //测试用
        responseData.message = '注册成功';
        res.json(responseData);
    }).catch(function (error) {
        //console.log('用户注册')
    });
});

/*
* 登陆
* */
router.post('/user/login',function (req,res) {
    var username = req.body.username;
    var password = req.body.password;

    if( username == ''|| password== ''){
        responseData.code= 1;
        responseData.message= '用户名或密码不能为空';
        res.json(responseData);
        return;
    }

    //查询数据库中相同用户名和密码的记录是否存在，如果存在则登陆成功
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        //用户名和密码是正确的
        responseData.message = '登陆成功';
        //返回用户名和id
        responseData.userInfo = {
          _id: userInfo._id,
          username: userInfo.username
        };
        //发送cookies
        req.cookies.set('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;
    }).catch(function (error) {
        console.log('登陆')
    })
    
});

/*
* 退出登陆
* */
router.get('/user/logout',function (req,res) {
    //设置cookies为空
    req.cookies.set('userInfo',null);
    responseData.message = '退出';
    res.json(responseData);
    return;
});

/*
* 获取指定文章的所有评论
* */
router.get('/comment',function (req,res) {

    var contentId = req.query.contentid || '';

    //console.log(contentId);
    if( contentId != 0){
        Content.findOne({
            _id: contentId
        }).then(function (content) {
            responseData.message = '获取评论成功';
            responseData.data = content.comments;
            res.json(responseData);
        }).catch(function (reason) {
            console.log('获取评论');
        })
    }

});

/*
* 评论提交
* */
router.post('/comment/post',function (req,res) {
    //内容的id
    var contentId = req.body.contentid || '';
    //console.log(req.body);

    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇文章内容
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message =  '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    }).catch(function (error) {
        console.log('评论提交')
    })

});
module.exports = router;