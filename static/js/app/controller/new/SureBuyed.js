define([ 'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/util/dict',
    'app/module/loading/loading'
], function(base, Ajax, dialog, dict, loading) {
    init()
    function init(){
    	getAccount();
        addListener();
    }
    
    // 获取账户信息
    function getAccount(){
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function(res){
            if(res.success){
                var data = res.data;
                data.forEach(function(d, i){
                    if(d.currency == "CNY"){
                        $("#rmbRemain").html("¥" + base.formatMoney(d.amount));
                    }
                })
            }
        });
    }
    function addListener() {

        var userId =  sessionStorage.getItem("userId");
        var token =  sessionStorage.getItem("token");
        var price = base.getUrlParam("price");

        $(".price").text(price)
        $("#payNum").text("￥"+price)
        $("#sureBuyed").on("click",function () {
            var payType;
            var hzbTemplateCode = base.getUrlParam("hzbTemplateCode");
                var buyWay = $("input[name='buy']:checked").val();
                // $("#toPay").css("id").remove()

                if (buyWay == "wxPay") {
                    payType = 5;

                } else if (buyWay == "yePay") {
                    payType = 1;
                } else {
                    base.showMsg("请选择支付方式");
                }


            var param = {
                "userId":userId,
                "payType":payType,
                "hzbTemplateCode": hzbTemplateCode
            };

            Ajax.post('615111', {json:param})
                .then(function (res) {
                    if(res.success){
                        if(payType == 5 ){
                            wxPay(res.data)
                        }else{
                            base.showMsg("支付成功");
                            setTimeout(function () {
                                location.href = "../new/hadBuyed.html"
                            },1000)

                        }
                    }else{
                    	if(res.msg=="账户余额不足"){
		                	base.confirm("账户余额不足，是否前往充值？","否","是").then(function(){
		                		
		                        location.href = "../pay/cny_recharge.html";
		                	},function(){
		                        
		                	})
		                }else{
		                	base.showMsg(res.msg);
		                }
                    }
                });
        })


       var wxConfig = {};

	    function onBridgeReady() {
	        WeixinJSBridge.invoke(
	            'getBrandWCPayRequest', {
	                "appId": wxConfig.appId, //公众号名称，由商户传入
	                "timeStamp": wxConfig.timeStamp, //时间戳，自1970年以来的秒数
	                "nonceStr": wxConfig.nonceStr, //随机串
	                "package": wxConfig.wechatPackage,
	                "signType": wxConfig.signType, //微信签名方式：
	                "paySign": wxConfig.paySign //微信签名
	            },
	            function(res) {
	                loading.hideLoading();
	                // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
	                if (res.err_msg == "get_brand_wcpay_request:ok") {
                        base.showMsg("支付成功");
                        setTimeout(function () {
                            location.href = "../new/hadBuyed.html"
                        },1000)
	                } else {
	                    base.showMsg("支付失败");
	                }
	            }
	        );
	    }
	    function wxPay(data){
	        wxConfig = data;
	        if (data && data.signType) {
	            if (typeof WeixinJSBridge == "undefined") {
	                if (document.addEventListener) {
	                    document.removeEventListener("WeixinJSBridgeReady", onBridgeReady);
	                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
	                } else if (document.attachEvent) {
	                    document.detachEvent('WeixinJSBridgeReady', onBridgeReady);
	                    document.detachEvent('onWeixinJSBridgeReady', onBridgeReady);
	                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
	                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
	                }
	            } else {
	                onBridgeReady();
	            }
	        } else {
	            loading.hideLoading();
	            base.showMsg(data.msg || "微信支付失败");
	        }
	    }

    }

    
});