
define([ 'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/util/dict',
    'jweixin',
], function(base, Ajax, dialog, dict, wx) {
    var hzbCode = base.getUrlParam("hzbCode");
    var hbCode = base.getUrlParam("hbCode");
    var userId = base.getUserId();
    var mobile ;
    
    init();
    
    function init(){
        addListener();
        getInitWXSDKConfig();
    }
    
    function addListener() {
    	
        var param = {
            "code": hbCode
        };
		
		$.when(
			Ajax.get('615136', param),
			base.getDictList("615907","hzb_mgift_status"),
			base.getUser()
		).then(function (res, res2,res3) {
            if (res.success && res2.success && res3.success) {
            	
            	var dictData = res2.data
            	var status= res.data.status;
                var slogan = res.data.slogan;
                var code = res.data.code;
                mobile = res3.data.mobile;
                var s = "";
            	
            	s +='<div class="wp100 fl s_12">'
            	s +='<p class="t_white"><span>'+slogan+'</span></p>'
		        s +='<p class=" t_white pt10">红包编号:<span class="ml20">'+code+'</span></p>'
	        	s +='<p class=" t_white pt8 fs13">状态：<span class="status">'+base.getDictListValue(status,dictData)+'</span></p></div>'
	        
				$(".hzbList").append(s)
            } else {
                base.showMsg(res.msg && res2.msg )
            }
        });

    }
    
    // 获取微信初始化的参数
    function getInitWXSDKConfig() {
        Ajax.get("807910", {
            companyCode: SYSTEM_CODE,
            url: location.href.split("#")[0]
        }).then(function(res) {
            initWXSDK(res.data);
        }, function() {
//          alert("catch");
        });
    }
    
    // 初始化微信参数
    function initWXSDK(data) {
        wx.config({
            appId: data.appId, // 必填，公众号的唯一标识
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature, // 必填，签名，见附录1
            jsApiList: ["onMenuShareQQ", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function() {
            // 分享给朋友
            wx.onMenuShareAppMessage({
                title: "姚橙商城,领取定向红包", // 分享标题
                desc: "姚橙商城,领取定向红包", // 分享描述
                link: window.location.href+"&userReferee="+userId, // 分享链接
                imgUrl: SHAKEURL+"/static/images/logo2.png", // 分享图标
                success: function() {
                    // 用户确认分享后执行的回调函数
                    
                    shakeWin();
                },
                fail: function(msg) {
                    alert(JSON.stringify(msg));
                }
            });
            // 分享到朋友圈
            wx.onMenuShareTimeline({
                title: "姚橙商城,领取定向红包", // 分享标题
                desc: "姚橙商城,领取定向红包", // 分享描述
                link: window.location.href+"&userReferee="+userId, // 分享链接
                imgUrl: SHAKEURL+"/static/images/logo2.png", // 分享图标
                success: function() {
                    // 用户确认分享后执行的回调函数
                    shakeWin();
                },
                fail: function(msg) {
                    alert(JSON.stringify(msg));
                }
            });
            // 分享到QQ
            wx.onMenuShareQQ({
                title: "姚橙商城,领取定向红包", // 分享标题
                desc: "姚橙商城,领取定向红包", // 分享描述
                link: window.location.href+"&userReferee="+userId, // 分享链接
                imgUrl: SHAKEURL+"/static/images/logo2.png", // 分享图标
                success: function () {
                   shakeWin();
                },
                fail: function(msg) {
                    alert(JSON.stringify(msg));
                }
            });
            // 分享到QQ空间
            wx.onMenuShareQZone({
                title: "姚橙商城,领取定向红包", // 分享标题
                desc: "姚橙商城,领取定向红包", // 分享描述
                link: window.location.href+"&userReferee="+userId, // 分享链接
                imgUrl: SHAKEURL+"/static/images/logo2.png", // 分享图标
                success: function () {
                   shakeWin();
                },
                fail: function(msg) {
                    alert(JSON.stringify(msg));
                }
            });
        });
        wx.error(function(error) {
            alert("微信分享sdk初始化失败" + JSON.stringify(error));
        })
    }
	
	function shakeWin() {
    	Ajax.get("615130",{
		    "code": hbCode,
    	}).then(function(res){
    		if(res.success){
    			location.href = "redPapper.html?hzbCode="+hzbCode;
    		}else{
    			base.showMsg(res.msg)
    		}
    		
    	})
        
    }
});