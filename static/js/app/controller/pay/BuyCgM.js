define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/AccountCtr',
    'app/module/weixin'
], function(base, GeneralCtr, AccountCtr, weixin) {
    var rate = 1;
    var choseIdx = 0, totalAmount = 0;

    init();

    function init() {
        addListeners();
        base.showLoading();
        $.when(
            getAccount(),
            getCB2CNYRate()
        ).then(base.hideLoading);
    }
    // 获取人民币转橙券汇率
    function getCB2CNYRate(){
        return getTransRate("CNY", "CB");
    }
    // 获取转化汇率
    function getTransRate(from, to){
        return GeneralCtr.getTransRate(from, to)
            .then(function(data){
                rate = data.rate;
            });
    }
    // 获取账户
    function getAccount(){
        return AccountCtr.getAccount()
            .then(function(data){
                data.forEach(function(d, i){
                    if(d.currency == "CNY"){
                        $("#reamin").html("¥" + base.formatMoney(d.amount));
                    }
                });
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
            }else{
                totalAmount = 0;
                $("#needAmount").val(0);
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
    // 微信支付
    function payWX(payType){
        base.showLoading("支付中...");
        AccountCtr.payCQ(totalAmount, payType)
            .then(wxPay);
    }
    // 余额支付
    function pay(payType){
        base.showLoading("支付中...");
        AccountCtr.payCQ(totalAmount, payType)
            .then(function(data){
            	base.hideLoading();
                base.showMsg("支付成功");
                setTimeout(function(){
        			base.getBack();
                }, 1000);
            });
    }
    // 根据config调用微信原生支付
    function wxPay(data){
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    base.getBack();
                }, 1000);
            }, () => {
                base.showMsg("支付失败");
            });
        } else {
            base.hideLoading();
            base.showMsg("微信支付失败");
        }
    }
});
