var SYSTEM_USERID = 'SYS_USER_YAOCHENG';
var SYSTEM_CODE = "CD-CYC000009";
var COMPANYCODE = "CD-CYC000009";
var PIC_PREFIX = 'http://oq4vi26fi.bkt.clouddn.com/';
var PIC_DETAIL = '?imageMogr2/auto-orient/thumbnail/!750x480r';
// 当季水果
var DJSG = 'FL201706252051242143422';
// 配送计划
var PSJH = 'FL20170627100000001';
// 果树认购
var GSRG = 'FL20170627100000002';
// 北大荒
var BDH = 'FL201706141015520756888';
// 热门活动
var RMHD = 'CP2017070317291303878453';

(function() {
    // 判断是否登录
    if (!/\/redirect\.htm/.test(location.href)) {
        var arr,
            reg = new RegExp("(^| )userId=([^;]*)(;|$)"),
            userId,
            userReferee = "";
        if (arr = document.cookie.match(reg))
            userId = unescape(arr[2]);
        // 未登录
        if (!userId) {
            var reg = new RegExp("(^|&)userReferee=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                userReferee = decodeURIComponent(r[2]);
            sessionStorage.setItem("userReferee", userReferee);
            sessionStorage.setItem("l-return", location.pathname + location.search);
            location.replace("../user/redirect.htm");
        }
    }
})()
