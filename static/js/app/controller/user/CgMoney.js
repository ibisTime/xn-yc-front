define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/util/dict',
    'jweixin',
], function(base, Ajax, loading, Dict, wx) {
    var accountNumber,
        config = {
            start: 1,
            limit: 20
        };
    var isEnd = false,
        canScrolling = false;
    var fundType = Dict.get("fundType");

    init();

    function init(){
        loading.showLoading();
        getAccount()
            .then(function(res){
                if (res.success) {
                    var data = res.data;
                    for(var i = 0; i < data.length; i++){
                        if(data[i].currency == "CB"){
                            config.accountNumber = data[i].accountNumber;
                            $("#amount").html(base.formatMoneyD(data[i].amount));
                            break;
                        }
                    }
                    getPageFlow();
                }
            })
        addListener();
    }
    // 获取账户信息
    function getAccount() {
        return Ajax.get("802503", {
            userId: base.getUserId()
        });
    }
    function getPageFlow(){
        Ajax.get("802524", config)
            .then(function(res){
                if(res.success && res.data.list.length){
                    var html = "";
                    $.each(res.data.list, function(index, item){
                        var positive = +item.transAmount >= 0 ? true : false,
                            transClass = positive ? "t_21b504" : "t_f64444",
                            prefix = positive && "+" || ""
                        html += '<li class="plr20 ptb20 b_bd_b clearfix lh15rem">'+
                                    '<div class="wp60 fl s_10">'+
                                        '<p class="t_4d">' + item.bizNote + '</p>'+
                                        '<p class="s_09 t_999 pt10">' + base.formatDate(item.createDatetime, "yyyy-MM-dd hh:mm:ss") + '</p>'+
                                    '</div>'+
                                    '<div class="wp40 fl tr ' + transClass + ' s_10">'+
                                        '<span class="inline_block va-m pt1em">' + prefix + base.formatMoneyD(item.transAmount) + '</span>'+
                                    '</div>'+
                                '</li>';
                    });
                    $("#fd-ul").html(html);
                }else{
                    if(res.msg){
                        base.showMsg(res.msg);
                        if(config.start == 1){
                            doError();
                        }
                    }else if(config.start == 1){
                        doError("暂无资金流水!");
                    }
                }
            });
    }
    function doError(msg) {
        $("#fd-ul").html('<li class="bg_fff" style="text-align: center;line-height: 93px;">' + (msg || "暂时无法查到数据!") + "</li>");
    }
    function addListener(){
        $("#buyCg").on("click",function(){
            location.href="../pay/buyCgM.html"
        })
        $(window).on("scroll", function() {
            // var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                addListener();
            }
        });
        $("#buyCard").click(function(){
        	getInitWXSDKConfig();
        })
    }
    
    
    // 获取微信初始化的参数
    function getInitWXSDKConfig() {
        Ajax.get("807910", {
            companyCode: SYSTEM_CODE,
            url: location.href.split("#")[0]
        }).then(function(res) {
            initWXSDK(res.data);
        }, function() {
            // alert("catch");
        });
    }
    // 初始化微信参数
    function initWXSDK(data) {
        wx.config({
            appId: data.appId, // 必填，公众号的唯一标识
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature, // 必填，签名，见附录1
            jsApiList: ["scanQRCode"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function() {
            // 扫一扫
            wx.scanQRCode({
                needResult: 1,
            	desc: 'scanQRCode desc',
            	success: function (res) {
            		var result = res.resultStr;
            		var param={
            			"userId": base.getUserId(),
						"couponCode": result.split('code=')[1],
            		}
            		loading.createLoading("卡券充值中...");
            		Ajax.post("805321",{
            			json:param
            		}).then(function(res){
            			if(res.success){
            				loading.hideLoading();
            				location.href="./get_success.html";
		    			}else{
		    				loading.hideLoading();
            				base.showMsg(res.msg)
            			}
            		})
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
    
    
});
