define([
    'app/controller/base',
    'app/interface/AccountCtr',
    'app/interface/MallCtr'
], function(base, AccountCtr, MallCtr) {
    var code = base.getUrlParam("code"),
        amount = base.getUrlParam("a"),
        rate = base.getUrlParam("rate");

    init();

    function init() {
        base.showLoading();
        getAccount().then(base.hideLoading);
        addListeners();
        amount = amount * 1000;
        $("#needAmount").val(base.formatMoneyD(amount) + "元");
        $("#CBAmount").val(base.formatMoneyD(amount * rate) + "橙券");
        $("#totalAmount").text(base.formatMoneyD(amount * rate));
    }

    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount()
            .then(function(data) {
                data.forEach(function(d, i) {
                    if (d.currency == "CB") {
                        $("#CBRemain").html(base.formatMoneyD(d.amount));
                    }
                })
            });
    }

    function addListeners() {
        //确认按钮
        $("#sbtn").on("click", function() {
            $("#integral").text(base.formatMoneyD(amount * rate));
            $("#od-mask, #od-tipbox").removeClass("hidden");
        });
        //提示框确认按钮
        $("#odOk").on("click", function() {
            integralConsume();
        });
        //提示框取消按钮
        $("#odCel").on("click", function() {
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
    }
    // 橙券支付
    function integralConsume() {
        base.showLoading("支付中...");
        MallCtr.payRechargeCardOrder([code])
            .then(function() {
                base.hideLoading();
                $("#od-mask, #od-tipbox").addClass("hidden");
                location.href = "./pay_success.html";
            }, function(error, d){
                if(d && error == "账户余额不足"){
                    d.close().remove();
                    base.confirm("账户余额不足，是否前往充值？", "否", "是").then(function() {
                        location.href = "../pay/buyCgM.html";
                    }, function() {});
                }
            });
    }

});
