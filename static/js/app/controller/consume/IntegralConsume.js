define([
    'app/controller/base',
    'app/interface/O2OCtr',
    'app/interface/AccountCtr'
], function (base, O2OCtr, AccountCtr) {
    var code = base.getUrlParam("c"),
        name = base.getUrlParam("n");

    init();

    function init(){
        if(code){
            base.showLoading();
            if(name){
                $("#name").text(name);
                getAccount().then(base.hideLoading);
                addListeners();
            }else{
                $.when(
                    getAccount(),
                    business()
                ).then(base.hideLoading);
            }
        }else{
            base.showMsg("未传入商家编号!");
        }
    }

    // 获取账户信息
    function getAccount(){
        return AccountCtr.getAccount()
            .then(function(data){
                data.forEach(function(d, i){
                    if(d.currency == "CB"){
                        $("#CBRemain").html(base.formatMoney(d.amount));
                    }
                });
            });
    }
    //根据code搜索商家信息
    function business(){
        return O2OCtr.getBusiness(code)
            .then(function (data) {
                $("#name").text(data.name);
                addListeners();
            });
    }
    function addListeners() {
        //确认按钮
        $("#sbtn").on("click", function(){
            var aVal = $("#amount").val();
            if(!aVal){
                base.showMsg("消费橙券不能为空!");
            }else if(+aVal <= 0){
                base.showMsg("消费橙券必须大于0!");
            }else{
                $("#integral").text(aVal);
                $("#od-mask, #od-tipbox").removeClass("hidden");
            }
        });
        //提示框确认按钮
        $("#odOk").on("click", function(){
            integralConsume();
        });
        //提示框取消按钮
        $("#odCel").on("click", function(){
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
    }
    //橙券埋单
    function integralConsume(){
        base.showLoading("支付中...");
        O2OCtr.payByCQ(code, +$("#amount").val() * 1000)
            .then(function (data) {
                base.hideLoading();
                $("#od-mask, #od-tipbox").addClass("hidden");
                base.showMsg("支付成功!");
                setTimeout(function(){
                    location.href = "../consume/detail.html?c=" + code;
                }, 1000)
            }, function(error, d){
                if(d && error == "橙券账户余额不足"){
                    d.close().remove();
                    base.confirm("橙券余额不足，是否前往购买？", "否", "是").then(function(){
                        location.href = "../pay/buyCgM.html";
                	}, function(){});
                }
            });
    }
});
