define([
    'app/controller/base',
    'app/module/foot',
    'app/interface/UserCtr',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr'
], function(base, Foot, UserCtr, AccountCtr, GeneralCtr) {

    init();

    function init() {
        // $("#tcdl").click(function(){
        //     base.clearSessionUser();
        //     location.reload(true);
        // });
        Foot.addFoot(3);
        base.showLoading("加载中...", 1);
        $.when(
            getUserInfo(),
            getAccount()
        ).then(base.hideLoading);
        $.when(
            getMobile(),
            getServiceTime()
        ).then(() => {
            $("#infos").removeClass("hidden");
        });
    }
    // 获取手机号
    function getMobile() {
        return GeneralCtr.getSysConfig("telephone")
            .then(function(data) {
                $("#telephone").html('<a href="tel://' + data.note + '">' + data.note + '</a>');
            });
    }
    // 获取服务时间
    function getServiceTime() {
        return GeneralCtr.getSysConfig("serviceTime")
            .then(function(data) {
                $("#time").html(data.note);
            });
    }
    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount()
            .then(function(data) {
                data.forEach(function(d, i) {
                    if (d.currency == "CNY") {
                        $("#cnyAmount").html(base.formatMoneyD(d.amount));
                    } else if (d.currency == "CB") {
                        $("#cbAmount").html(base.formatMoneyD(d.amount));
                    }
                })
            });
    }
    // 获取用户信息
    function getUserInfo() {
        return UserCtr.getUser().then(function(data) {
            $("#nickName").text(data.nickname);
            $("#userImg").attr("src", base.getImg(data.userExt.photo))
            $("#mobile").text(data.mobile);
            sessionStorage.setItem("m", data.mobile);
        });
    }
});
