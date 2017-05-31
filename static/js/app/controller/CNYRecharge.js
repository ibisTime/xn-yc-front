define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
    var rate = 1;
    var code = base.getUrlParam("c");
    var choseIdx = 0, totalAmount = 0, accountNumber;

    initView();

    function initView() {
        addListeners();
        loading.createLoading();
        $.when(
            getAccount()
            // getBankCardList()
        ).then(loading.hideLoading, loading.hideLoading);
    }
    function getAccount(){
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function(res){
            if(res.success){
                var data = res.data;
                data.forEach(function(d, i){
                    if(d.currency == "CNY"){
                        // $("#reamin").html("¥" + base.formatMoney(d.amount));
                        accountNumber = d.accountNumber;
                    }
                })
            }
        });
    }
    // 获取银行卡信息
    function getBankCardList(){
        return Ajax.get("802016", {
            userId: base.getUserId(),
            status: "1"
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                if(res.data.length){
                    var html = "";
                    res.data.forEach(function(item){
                        html += '<option value="'+item.bankcardNumber+'">'+item.bankcardNumber+'</option>';
                    });
                    $("#bankcardNumber").html(html).trigger("change");
                }else{
                    base.showMsg("您还未绑定银行卡");
                }
            }else{
                base.showMsg(res.msg);
            }
        });
    }
    function addListeners() {
        // $("#rechargeForm").validate({
        //     'rules': {
        //         transAmount: {
        //             required: true,
        //             isPositive: true,
        //             gt1: true
        //         },
        //         bankcardNumber: {
        //             required: true
        //         }
        //     },
        //     onkeyup: false
        // });
        $("#sbtn").click(function(){
            if($("#CBAmount").val()){
            	totalAmount = $("#CBAmount").val()*1000;
            	base.getUser().then(function(res){
            		if(res.success){
            			doRecharge(res.data.openId);
            		}else{
            			base.showMsg(res.msg)
            		}
            	})
                
            }else{
            	base.showMsg("请输入充值金额")
            }
        });
        $("#bankcardNumber").on("change", function(){
            $("#bankcardNumberSpan").html($(this).val());
        })
    }
    function doRecharge(o){
        loading.createLoading("充值中...");
        Ajax.post("802710", {
            json: {
                applyUser: base.getUserId(),
                amount: totalAmount,
                channelType: 35,
                openId:o
            }
        }).then(function(res){
            if(res.success){
                wxPay(res.data);
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
                    setTimeout(function() {
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
