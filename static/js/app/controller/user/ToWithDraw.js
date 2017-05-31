define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
    var remainAmount = 0;
    var cuserQxbs = 0;
    var bankName ="";
    init();
    function init(){
        loading.createLoading();
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
        $.when(
            getAccount(),
            getBankCardList()
//          getRule()
        ).then(function () {
            loading.hideLoading();
        }, loading.hideLoading);
        
        addListeners();
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
                    bankName=res.data[0].bankName;
                    html += '<option data-name="'+res.data[0].bankName+'" value="'+res.data[0].bankcardNumber+'">'+res.data[0].bankcardNumber+'</option>';
                    $("#payCardNo").html(html).trigger("change");
                }else{
                    base.showMsg("请先绑定银行卡");
                    sessionStorage.setItem("returnhref",  location.href);
                    
                    setTimeout(function(){
                    	location.replace("./add_bankCard.html?return=1");
                    },1000)
                    
                }
            }else{
                base.showMsg(res.msg);
            }
        });
    }
    // 获取账户信息
    function getAccount(){
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function(res){
            if(res.success){
                var data = res.data;
                data.forEach(function(d, i){
                    if(d.currency == "CNY"){
                        $("#accountNumber").val(d.accountNumber);
                        remainAmount = +d.amount;
                        $("#remainAmount").val(base.formatMoney(d.amount));
                    }
                })
            }
        });
    }
    
//  //取现规则
//  function getRule(){
//  	Ajax.get("802025",{
//  		"start":1,
//  		"limit":15,
//  		"type":"2"
//  	}).then(function(res){
//  		if(res.success){
//  			
//  			res.data.list.forEach(function(v,i){
//  				if(v.ckey == "cuserQxfl"){
//  					$("#cuserQxfl").text(v.cvalue*100)
//  				}
//  				if(v.ckey == "cuserQxsx"){
//  					$("#cuserQxsx").text(v.cvalue)
//  				}
//  				if(v.ckey == "cuserQxbs"){
//  					cuserQxbs = v.cvalue;
//  					$("#cuserQxbs1").text(v.cvalue)
//  					$("#cuserQxbs").text(v.cvalue)
//  				}
//  			})
//  		}
//  	})
//  }
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
        $("#sbtn").click(function(){
            if($("#withDrawForm").valid()){
            	if(+$("#amount").val()<cuserQxbs){
            		base.showMsg("提现金额不能小于"+cuserQxbs);
            	}else{
            		doWithDraw();
            	}
            }
        });
        $("#payCardNo").on("change", function(){
            $("#payCardNoSpan").html($(this).val());
        })
    }
    function doWithDraw(){
        var param = $("#withDrawForm").serializeObject();
        param.remainAmount="";
        param.payCardInfo=bankName;
        param.amount = param.amount * 1000;
        param.applyUser=base.getUserId();
        param.applyNote="c端用户取现";
        Ajax.post("802750", {json: param})
            .then(function(res){
                if(res.success){
                    base.showMsg("提交成功");
                    setTimeout(function(){
                        base.getBack();
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            });
    }
});
