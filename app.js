/*
* 应用程序的启动（入口）文件
* */

/*
* 创建应用
* */

//加载express模块
var express = require('express');
//加载swig模板处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//加载中间件body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载cookies模块，保存用户登陆状态
var Cookies = require('cookies');
//创建app应用  等同=> NodeJS Http.createServer().
var app = express();

var User = require('./models/User');

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应的__dirname + '/public'
app.use('/public', express.static( __dirname + '/public'));

//配置应用模板
/*定义当前应用使用的模板引擎*/
//第一个参数：模板引擎名称，同时也是模板文件后缀，第二个参数：表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的目录，第一个参数必须是views,第二个参数是目录路径
app.set('views','./views');
//注册所使用的模板引擎，第一个参数必须是view engine,第二个参数和app.engine方法中定义的模板引擎的名称（第一个参数:html）是一致的
app.set('view engine','html');
//swig默认情况下，会将已解析的文件保存到缓存中。在开发的过程中，需要取消模板缓存
swig.setDefaults({cache: false});

//bodyparser设置
app.use( bodyParser.urlencoded({extended: true}) );

//设置cookies
app.use(function (req,res,next) {
    req.cookies = new Cookies(req,res);

    //解析登陆用户的cookies信息
    req.userInfo = {};

    if(req.cookies.get('userInfo')){
        try{
            req.userInfo =  JSON.parse(req.cookies.get('userInfo'));

            //获取当前用户的登陆类型，是否是管理员
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }
    }else{
        next();
    }


});

/*
* 根据不同的功能划分模块
* */
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

//链接数据库
/*解决错误提示：deprecationWarning:Mongoose: mpromise...(node:6636)*/
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/blog',{useMongoClient: true},function (err) {
    if(err){
        console.log('数据库连接失败')
    }else{
        console.log('数据库连接成功');
        //监听http请求8081端口(当数据库启动成功后才启动应用
        app.listen(8081);
    }
});



