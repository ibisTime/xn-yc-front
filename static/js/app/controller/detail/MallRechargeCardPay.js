define([
    'app/controller/base',
    'app/util/ajax',
    'lib/handlebars.runtime-v3.0.3'
], function (base, Ajax, Handlebars) {
    var code = base.getUrlParam("code"),
    	amount = base.getUrlParam("a"),
    	rate = base.getUrlParam("rate");

    initView();

    function initView(){
        getAccount();
        addListeners();
        amount = amount*1000;
        $("#needAmount").val(base.formatMoneyD(amount)+"元");
        $("#CBAmount").val(base.formatMoneyD(amount*rate)+"橙券");
        $("#totalAmount").text(base.formatMoneyD(amount*rate));
        $("#loaddingIcon").addClass('hidden');
    }
    
    // 获取账户信息
    function getAccount(){
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function(res){
            if(res.success){
                var data = res.data;
                data.forEach(function(d, i){
                    if(d.currency == "CB"){
                        $("#CBRemain").html(base.formatMoneyD(d.amount));
                    }
                })
            }
        });
    }
    
    function addListeners() {
        //确认按钮
        $("#sbtn").on("click", function(){
            $("#integral").text(base.formatMoneyD(amount*rate));
            $("#od-mask, #od-tipbox").removeClass("hidden");
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
    
    function integralConsume(){
        $("#loaddingIcon").removeClass("hidden");
        var dCode = [];
        dCode.push(code)
        Ajax.post('808651', {
            json: {
                codeList: dCode,
                payType: 90
            }
        }).then(function (res) {
                $("#loaddingIcon").addClass("hidden");
                $("#od-mask, #od-tipbox").addClass("hidden");
                if (res.success) {
                    location.href = "./pay_success.html";
                }else{
                    if(res.msg=="账户余额不足"){
	                	base.confirm("账户余额不足，是否前往充值？","否","是").then(function(){
	                        location.href = "../pay/buyCgM.html";
	                	},function(){
//	                        location.href = "../user/vorder_list.html";
	                	})
	                }else{
	                	base.showMsg(res.msg);
	                }
                }
            });
    }
    
});
