var prepage = 10;
var page = 1;
var pages = 0;
var comments = [];

//提交评论
$('#messageBtn').on('click',function () {
    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contentid: $('#contentId').val(),
            content: $('#messageContent').val()
        },
        success: function (responseData) {
            //console.log(responseData);
            $('#messageContent').val('');
            comments = responseData.data.comments.reverse();
            renderComment();
        }
    })
});

//每次页面重载的时候获取文章所有评论
$.ajax({
    url: '/api/comment',
    data: {
        contentid: $('#contentId').val()
    },
    success: function (responseData) {
        comments = responseData.data.reverse();
        renderComment();
    }
});


$('.fenye').delegate('a','click',function () {
    if ($(this).parent().hasClass('before')) {
        page--;
    } else if($(this).parent().hasClass('next')) {
        page++;
    }
    renderComment();
});


function renderComment() {

    $('#messageCount').html(comments.length);

    pages = Math.max(Math.ceil(comments.length / prepage),1);
    var start = Math.max(0,(page-1) * prepage);
    var end = Math.min(start + prepage,comments.length);

    $('.zhongjian').html(page+'/'+ pages);

    if(page <= 1){
        page = 1;
        $('.before').html('<li class="previous disabled"><a href="#"><span aria-hidden="true">&larr;</span> 没有上一页</a></li>');
    }else {
        $('.before').html('<li class="previous"><a href="#"><span aria-hidden="true">&larr;</span> 上一页</a></li>');
    }
    if(page >= pages){
        page = pages;
        $('.next').html('<li class="next disabled"><a href="#">没有下一页 <span aria-hidden="true">&rarr;</span></a></li>');
    }else{
        $('.next').html('<li class="next"><a href="#">下一页 <span aria-hidden="true">&rarr;</span></a></li>')
    }

    if(comments.length == 0) {
        $('.messageList').html('<p><strong>还没有评论</strong></p>');
    } else {
        var html = '';
        for (var i=start;i<end;i++) {
            html += '<div class="messageBox panel panel-success">\n' +
                '<div class="panel-heading">'+comments[i].username+'<p class="fr">' +formatDate(comments[i].postTime)+'</p></div>\n' +
                '<div class="panel-body">'+comments[i].content+'</div>\n'
                + '</div>'
        }
        $('.messageList').html(html);
    }
}

function formatDate(d) {

    var date1 = new Date(d);
    return date1.getFullYear()+'年'+(date1.getMonth()+1)+'月'+date1.getDate()+'日'
        +date1.getHours()+':'+date1.getMinutes()+':'+date1.getSeconds();
}