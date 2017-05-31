define([
    'app/controller/base',
    'app/util/ajax', 
    'app/module/loading/loading',
    'app/module/judgeBindMobile/judgeBindMobile',
    'app/module/foot/foot',
], function(base, Ajax, loading, JudgeBindMobile, Foot) {
	
	Foot.addFoot(3);
    initView();

    function initView() {
        loading.createLoading();
        $.when(
            getUserInfo(),
            getAccount(),
            getMobile()
        ).then(loading.hideLoading, loading.hideLoading);
        addListener();
        
//      $("#demo").click(function(){
//      	JudgeBindMobile.addCont({
//              success: function(resMobile, resSms){
//              	mobile = resMobile;
//              	smsCaptcha = resSms;
//              	alert("smsCaptcha1"+smsCaptcha+",mobile1"+mobile);
//              	getAppID();
//              }
//          }).showCont();
//      })
        
    }
    // 获取手机号
    function getMobile(){
        return Ajax.get("807717", {
            "ckey": "telephone"
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                $("#telephone").html('<a href="tel://'+res.data.note+'">'+res.data.note+'</a>');
            }else{
                base.showMsg(res.msg);
            }
        });
    }
    // 获取账户信息
    function getAccount() {
        return Ajax.get("802503", {userId: base.getUserId()}).then(function(res) {
            if (res.success) {
                var data = res.data;
                data.forEach(function(d, i) {
                    if (d.currency == "CNY") {
                        $("#cnyAmount").html(base.formatMoneyD(d.amount));
                    } else if (d.currency == "CB") {
                        $("#cbAmount").html(base.formatMoneyD(d.amount));
                    }
                })
            }
        });
    }
    // 获取用户信息
    function getUserInfo(){
        return base.getUser()
            .then(function(res) {
                if (res.success) {
                    var data = res.data;
                    $("#nickName").text(data.nickname);
                    $("#userImg").attr("src", base.getImg(res.data.userExt.photo))
                    $("#mobile").text(data.mobile);
                    sessionStorage.setItem("m", data.mobile);
                } else {
                    base.showMsg(res.msg || "暂时无法获取用户信息！");
                }
            });
    }
    function addListener(){
    	
    }
});
