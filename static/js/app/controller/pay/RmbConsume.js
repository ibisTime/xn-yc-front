define([
    'app/controller/base',
    'app/interface/AccountCtr',
    'app/interface/O2OCtr',
    'app/module/weixin'
], function(base, AccountCtr, O2OCtr, weixin) {
    var code = base.getUrlParam("c");
    var rate = base.getUrlParam("rate"),
        name = base.getUrlParam("n");
    var choseIdx = 0,
        totalAmount = 0;
    var rmbRemain = 0,
        fxCB = 0;

    init();

    function init() {
        if (code) {
            base.showLoading();
            $("#name").text(name);
            getAccount().then(base.hideLoading);
            addListeners();
        } else {
            base.showMsg("未传入订单编号!");
        }
    }
    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount().then(function(data) {
            data.forEach(function(d, i) {
                if (d.currency == "CNY") {
                    rmbRemain = +d.amount;
                    $("#rmbRemain").html("¥" + base.formatMoneyD(d.amount));
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
        $("#rmbAmount").on("keyup", function() {
            var self = $(this),
                value = self.val();
            if ($.isNumeric(value)) {
                if (!/^\d+(\.\d{1,2})?$/.test(value)) {
                    base.showMsg("小数点后最多两位")
                } else {
                    var needAmount = value * 1000,
                        fxCB = needAmount * rate;
                    $("#fxCB").val(base.formatMoney(fxCB));
                    $("#needAmount").val(base.formatMoney(needAmount));
                    totalAmount = value * 1000;
                    $("#totalAmount").html(base.formatMoney(needAmount));
                }
            } else {
                totalAmount = 0;
                $("#jfAmount").val(0);
                $("#needAmount").val(0);
                $("#totalAmount").html(0);
            }
        });
        $("#sbtn").click(function() {
            if ($("#rmbAmount").val()) {
                if (!/^\d+(\.\d{1,2})?$/.test($("#rmbAmount").val())) {
                    base.showMsg("小数点后最多两位")
                } else {
                    if (choseIdx == 0) { //  余额支付
                        pay(1);
                    } else { //微信支付
                        pay(5);
                    }
                }
            } else {
                base.showMsg("请输入消费金额");
            }
        });
    }
    // 埋单
    function pay(payType) {
        base.showLoading("支付中...");
        O2OCtr.payByRmb(code, totalAmount, payType).then(function(data) {
            base.hideLoading();
            if (payType == 1) {
                base.showMsg("支付成功");
                setTimeout(function() {
                    location.href = "../consume/detail.html?c=" + code;
                }, 1000);
            } else {
                wxPay(data);
            }
        }, function(error, d) {
            if (d && error == "账户余额不足") {
                d.close().remove();
                base.confirm("账户余额不足，是否前往充值？", "否", "是").then(function() {
                    location.href = "../pay/cny_recharge.html";
                }, function() {});
            }
        });
    }
    // 微信支付
    function wxPay(data) {
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    location.href = "../consume/detail.html?c=" + code;
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
