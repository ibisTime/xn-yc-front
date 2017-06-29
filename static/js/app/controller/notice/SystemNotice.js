define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {

    var start = 1; //第几页
    var startNum; //总页数
    var sum; ////总条数
    var limitNum = 10; //每页个数
    var num = 0; //已加载消息数

    var list = "";

    ajaxUpdata(start, limitNum);

    $(".updateMore").on("click", function() {
        if (start < startNum) {
            start++;
            ajaxUpdata(start, limitNum);
        } else {
            start = start;
            $(".updateMore p").html("没有更多  ···")
        }
    })

    function ajaxUpdata(sta, lim) {
        GeneralCtr.getPageSysNotice(sta, lim)
            .then(function(data) {
                var smsTitle; //标题
                var pushedDatetime; //公告时间
                var smsContent; //公告内容

                startNum = data.totalPage; //总页数
                sum = data.totalCount; //总条数

                var img = __inline("../images/消息@2x.png");
                for (var i = 0; i < limitNum; i++) {
                    var s = "";
                    if (num > sum - 1) { //消息加载总条数多余消息总条数时跳出循环
                        num = num;
                        break;
                    } else {
                        smsTitle = data.list[i].smsTitle; //标题
                        pushedDatetime = data.list[i].pushedDatetime; //公告时间
                        smsContent = data.list[i].smsContent; //公告内容
                        pushedDatetime = base.formatDate(pushedDatetime, "yyyy-MM-dd");

                        s += "<div class='flex b_e6_b' style='margin: 20px 0 10px 10px;padding-right:10px'>";
                        s += "<div class='pr10 flex-s newp' style='max-width:60px;'><img src='" + img + "' class='newp'/></div>";
                        s += "<div  style='padding-bottom: 25px;-webkit-box-flex: 1;-ms-flex: 1;flex: 1;'><div>";
                        s += "<div class='fs15'>" + smsTitle + "</div>";
                        s += "<div class='fs13'  style='color: #999999'>" + pushedDatetime + "</div>";
                        s += "</div><div class=' bg_f5 ptb15 plr10 fs13 mt10' style='color: #999;border-radius:4px;line-height:20px;'>" + smsContent + "</div></div></div>";
                        list += s;

                        num++;
                    }
                }
                $("#noticeWrap").html(list);
                if (num > sum - 1) {
                    $(".updateMore p").html("没有更多  ···");
                } else {
                    $(".updateMore p").html("加载更多  ···")
                }
            });
    }
});
