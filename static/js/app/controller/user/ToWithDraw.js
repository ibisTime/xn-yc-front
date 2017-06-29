define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/interface/AccountCtr'
], function(base, Validate, UserCtr, AccountCtr) {
    var remainAmount = 0;
    var cuserQxbs = 0;
    var bankName = "";
    init();
    function init() {
        base.showLoading();
        //小于指定数
        jQuery.validator.addMethod("gt1", function(value, element) {
            var returnVal = false;
            var gt = remainAmount;
            value = +value * 1000;
            if (value <= gt && value != "") {
                returnVal = true;
            }
            return returnVal;
        }, "提现金额不能大于账户余额");
        $.when(getAccount(), getBankCardList()).then(base.hideLoading, base.hideLoading);

        addListeners();
    }
    // 获取银行卡信息
    function getBankCardList() {
        return UserCtr.getBankCardList()
            .then(function(data) {
                base.hideLoading();
                if (data.length) {
                    var html = "";
                    bankName = data[0].bankName;
                    html += '<option data-name="' + data[0].bankName + '" value="' + data[0].bankcardNumber + '">' + data[0].bankcardNumber + '</option>';
                    $("#payCardNo").html(html).trigger("change");
                } else {
                    base.showMsg("请先绑定银行卡");
                    sessionStorage.setItem("returnhref", location.href);

                    setTimeout(function() {
                        location.replace("./add_bankCard.html?return=1");
                    }, 1000)

                }
            });
    }
    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount()
            .then(function(data) {
                data.forEach(function(d, i) {
                    if (d.currency == "CNY") {
                        $("#accountNumber").val(d.accountNumber);
                        remainAmount = +d.amount;
                        $("#remainAmount").val(base.formatMoney(d.amount));
                    }
                });
            });
    }

    function addListeners() {
        $("#withDrawForm").validate({
            'rules': {
                amount: {
                    required: true,
                    isPositive: true,
                    gt1: true
                },
                payCardNoSpan: {
                    required: true
                },
                tradePwd: {
                    required: true,
                    isNotFace: true,
                    maxlength: 255
                }
            },
            onkeyup: false
        });
        $("#sbtn").click(function() {
            if ($("#withDrawForm").valid()) {
                if (+ $("#amount").val() < cuserQxbs) {
                    base.showMsg("提现金额不能小于" + cuserQxbs);
                } else {
                    doWithDraw();
                }
            }
        });
        $("#payCardNo").on("change", function() {
            $("#payCardNoSpan").html($(this).val());
        });
    }
    function doWithDraw() {
        var param = $("#withDrawForm").serializeObject();
        param.remainAmount = "";
        param.payCardInfo = bankName;
        param.amount = param.amount * 1000;
        param.applyNote = "c端用户取现";
        AccountCtr.withDraw(param).then(function() {
            base.showMsg("提交成功");
            setTimeout(function() {
                base.getBack();
            }, 1000);
        });
    }
});
