//通过模型类来操作数据
var mongoose = require('mongoose');
var contentsSchema = require('../schemas/content');

//设置模块user类并通过module.exports 展示出去
module.exports = mongoose.model('Content',contentsSchema);