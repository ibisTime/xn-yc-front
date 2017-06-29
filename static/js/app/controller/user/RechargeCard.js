define([
    'app/controller/base',
    'app/interface/AccountCtr'
], function(base, AccountCtr) {
    var couponCode = base.getUrlParam("code");

    init();

    function init() {
        base.showLoading("卡券充值中...");
        AccountCtr.rechargeByCard(couponCode)
            .then(function() {
                base.hideLoading();
                location.href = "./get_success.html";
            }, function(){
                setTimeout(function() {
                    location.href = "../index.html"
                }, 1600);
            })
    }
})
