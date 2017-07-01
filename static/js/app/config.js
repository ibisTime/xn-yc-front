var SYSTEM_USERID = 'SYS_USER_YAOCHENG';
var SYSTEM_CODE = "CD-CYC000009";
var COMPANYCODE = "CD-CYC000009";
var PIC_PREFIX = 'http://oq4vi26fi.bkt.clouddn.com/';
var PIC_DETAIL = '?imageMogr2/auto-orient/thumbnail/!750x480r';
// 当季水果
var DJSG = 'FL2017062717595130212478';
// 配送计划
var PSJH = 'FL2017062716471159133341';
// 果树认购
var GSRG = 'FL2017062717580920664616';
// 北大荒
var BDH = 'FL2017062718001781516128';
// 热门活动
var RMHD = 'CP2017062914400134550585';

(function() {
    // 判断是否登录
    if (!/\/redirect\.html/.test(location.href)) {
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
            location.replace("../user/redirect.html");
        }
    }
})()
