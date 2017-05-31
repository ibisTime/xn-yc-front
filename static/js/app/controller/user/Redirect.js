define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/judgeBindMobile/judgeBindMobile',
    'app/module/bindMobileSms/bindMobile',
], function(base, Ajax, loading, JudgeBindMobile,BindMobileSms) {
	
	var mobile =  base.getUrlParam("m") || "";
	var smsCaptcha =  base.getUrlParam("s") || "";
    var userReferee = sessionStorage.getItem("userReferee") || "";
    if(userReferee==""){
    	userReferee = SYSTEM_USERID
    }
	
    init();

    function init() {
        var code = base.getUrlParam("code");
        // 第一次没登录进入的页面
        if (!code) {
            loading.createLoading();
            getAppID();
            return;
        }
        if (!base.isLogin()) {  // 未登录
            loading.createLoading("登录中...");
//          alert(mobile+smsCaptcha);
//          base.showMsg(code,120000);
            wxLogin({
                code: code,
            	mobile: mobile,
            	smsCaptcha: smsCaptcha,
            	userReferee:userReferee,
                companyCode: SYSTEM_CODE
            });
            
        } else {    // 已登陆
            setTimeout(function() {
                base.goBackUrl();
            }, 1000);
        }
    }
    // 获取appId并跳转到微信登录页面
    function getAppID() {
        Ajax.get("806031", {
                companyCode: SYSTEM_CODE,
                account: "ACCESS_KEY",
                type: "3"
           }).then(function(res) {
                if (res.success && res.data.length) {
                    var appid = res.data[0].password;
                    var redirect_uri = encodeURIComponent(base.getDomain() + "/user/redirect.html?m="+mobile+"&s="+smsCaptcha);
                    loading.hideLoading();
                    location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid +
                        "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo#wechat_redirect";
                } else {
                    loading.hideLoading();
                    base.showMsg(res.msg || "非常抱歉，微信登录失败");
                }
            }, function() {
                loading.hideLoading();
                base.showMsg("非常抱歉，微信登录失败");
            });
    }
    // 微信登录
    function wxLogin(param) {
    	
//      alert(mobile+smsCaptcha)
        Ajax.post("805151", {
            json: param
        }).then(function(res) {
            if (res.success) {
            	if(res.data.userId==null ||res.data.userId=="" ){
            		loading.hideLoading();
            		JudgeBindMobile.addCont({
                        success: function(resMobile, resSms){
                        	mobile = resMobile;
                        	smsCaptcha = resSms;
                        	getAppID();
                        }
                    }).showCont();
            	}else{
            		loading.hideLoading();
            		base.setSessionUser(res);
            		var returnFistUrl = sessionStorage.getItem("returnFUrl");
            		
            		if(returnFistUrl){
            			location.href = returnFistUrl;
            		}else{
            			location.href="../index.html"
            		}
            	}
            } else {
                loading.hideLoading();
                base.showMsg(res.msg);
                setTimeout(function(){
                	BindMobileSms.addMobileCont({
	                	mobile: param.mobile,
			            success: function(resMobile, resSms){
	                    	mobile = resMobile;
	                    	smsCaptcha = resSms;
	                    	getAppID();
	                	},
			            error: function(msg) {
			                base.showMsg(msg);
			            },
			            hideBack: 1
			        }).showMobileCont();
                },1000)
		        
            }
        }, function() {
            loading.hideLoading();
            base.showMsg("非常抱歉，微信授权失败!");
        });
    }
});