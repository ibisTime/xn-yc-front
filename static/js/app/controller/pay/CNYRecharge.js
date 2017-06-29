define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/interface/AccountCtr',
    'app/module/weixin'
], function(base, UserCtr, AccountCtr, weixin) {
    var totalAmount = 0;

    init();

    function init() {
        addListeners();
    }
    function addListeners() {
        $("#sbtn").click(function() {
            if ($("#CBAmount").val()) {
                totalAmount = $("#CBAmount").val() * 1000;
                UserCtr.getUser().then(function(data) {
                    doRecharge(data.openId);
                })
            } else {
                base.showMsg("请输入充值金额");
            }
        });
    }
    // 充值
    function doRecharge(o) {
        base.showLoading("充值中...");
        AccountCtr.recharge(totalAmount, o)
            .then(wxPay);
    }
    // 微信支付
    function wxPay(data) {
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
