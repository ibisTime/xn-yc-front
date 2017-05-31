define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading'
], function(base, Ajax, loading) {
    var rate = 1;
    var choseIdx = 0, totalAmount = 0;

    initView();

    function initView() {
        addListeners();
        loading.createLoading();
        $.when(
            getAccount(),
            getCB2CNYRate()
        ).then(loading.hideLoading, loading.hideLoading);
    }
    // 获取人民币转橙券汇率
    function getCB2CNYRate(){
        return getTransRate("CNY", "CB");
    }
    // 获取转化汇率
    function getTransRate(from, to){
        return Ajax.get("002051", {
            fromCurrency: from,
            toCurrency: to
        }).then(function(res){
            rate = res.data.rate;
        });
    }
    // 获取账户
    function getAccount(){
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function(res){
            if(res.success){
                var data = res.data;
                data.forEach(function(d, i){
                    if(d.currency == "CNY"){
                        $("#reamin").html("¥" + base.formatMoney(d.amount));
                    }
                })
            }
        });
    }
    function addListeners() {
        $("#content").on("click", ".pay-item", function() {
            var _self = $(this),
                idx = _self.index();
            _self.siblings(".active").removeClass("active");
            _self.addClass("active");
            choseIdx = idx;
        });
        $("#CBAmount").on("keyup", function(){
            var self = $(this),
                value = self.val();
            if($.isNumeric(value)){
                totalAmount = value * 1000;
                $("#needAmount").val(base.formatMoney(totalAmount / rate));
                // $("#totalAmount").html(base.formatMoney(totalAmount / rate));
            }else{
                totalAmount = 0;
                $("#needAmount").val(0);
                // $("#totalAmount").html(0);
            }
        });
        $("#sbtn").click(function(){
        	var CBAmount = $("#CBAmount").val();
        	
            if(choseIdx == 0){  //  余额支付
                pay(1);
            }else { //微信支付
                if(/^[1-9]\d*$/.test(CBAmount)){
	        		payWX(5);
	        	}else{
	        		base.showMsg("购买数量只能为整数")
	        	}
            }
        });
    }
    function payWX(payType){
        loading.createLoading("支付中...");
        Ajax.post("802420", {
            json: {
            	fromUserId : base.getUserId(),
				toUserId : SYSTEM_USERID,
                amount: totalAmount,
                payType: payType,
                currency: "CB"
            }
        }).then(function(res){
            // console.log(res);
            // res.msg && base.showMsg(res.msg);
            if(res.success){
                loading.hideLoading();
                wxPay(res.data);
            }else{
                loading.hideLoading();
                base.showMsg(res.msg);
            }
        })
    }
    function pay(payType){
        loading.createLoading("支付中...");
        Ajax.post("802420", {
            json: {
                fromUserId : base.getUserId(),
				toUserId : SYSTEM_USERID,
                amount: totalAmount,
                payType: payType,
                currency: "CB"
            }
        }).then(function(res){
            // console.log(res);
            // res.msg && base.showMsg(res.msg);

            if(res.success){
                if(payType == 1){
                    // location.href = "../user/user_info.html";
                	loading.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(function(){
            			base.getBack();
                    }, 1000);
                }else{
                	
                	loading.hideLoading();
                    wxPay(res.data);
                }
            }else{
                loading.hideLoading();
                base.showMsg(res.msg);
            }
        })
    }
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
                    setTimeout(function(){
            			base.getBack();
                    }, 1000);
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
});
