define([
    'app/controller/base',
    'app/util/ajax',
    'lib/handlebars.runtime-v3.0.3'
], function (base, Ajax, Handlebars) {
    var code = base.getUrlParam("c") || "",
        name = base.getUrlParam("n");

    initView();

    function initView(){
        if(code){
            if(name){
                $("#name").text(name);
                $("#loaddingIcon").addClass('hidden');
                getAccount();
                addListeners();
            }else{
                business();
            }
        }else{
            base.showMsg("未传入商家编号!");
        }
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
                        $("#CBRemain").html(base.formatMoney(d.amount));
                    }
                })
            }
        });
    }
    //根据code搜索商家信息
    function business(){
        Ajax.post('808218', {code: code})
            .then(function (response) {
                $("#cont").remove();
                $("#loaddingIcon").addClass('hidden');
                if (response.success) {
                    var data = response.data;
                    $("#name").text(data.name);
                    addListeners();
                }else{
                    base.showMsg("无法获取商家信息!");
                }
            });
    }
    function addListeners() {
        //积分数量输入框
//      $("#amount").on("keyup", function (e) {
//          var keyCode = e.charCode || e.keyCode;
//          var me = $(this);
//          if(!isSpecialCode(keyCode) && !isNumber(keyCode)){
//              me.val(me.val().replace(/[^\d]/g, ""));
//          }
//      });
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
    //消费橙券
    function integralConsume(){
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post('808270', {
            json: {
                storeCode: code,
                amount: +$("#amount").val() * 1000,
                payType: "50",
                userId: base.getUserId()
            }
        }).then(function (response) {
                $("#loaddingIcon").addClass("hidden");
                $("#od-mask, #od-tipbox").addClass("hidden");
                if (response.success) {
                    location.href = "../consume/detail.html?c="+code;
                }else{
                    if(response.msg=="橙币账户余额不足"){
	                	base.confirm("橙券余额不足，是否前往购买？","否","是").then(function(){
	                        location.href = "../pay/buyCgM.html";
	                	},function(){
//	                        location.href = "../consume/detail.html?c="+code;
	                	})
	                }else{
	                	base.showMsg(response.msg);
	                }
	            }
            });
    }
    //是否是数字
    function isNumber(code){
        if(code >= 48 && code <= 57 || code >= 96 && code <= 105){
            return true;
        }
        return false;
    }
    //左、右、backspace、delete
    function isSpecialCode(code) {
        if(code == 37 || code == 39 || code == 8 || code == 46){
            return true;
        }
        return false;
    }
});
