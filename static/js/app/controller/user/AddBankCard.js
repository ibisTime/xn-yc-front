define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/UserCtr'
], function(base, Validate, UserCtr) {
    var returnUrl = sessionStorage.getItem("returnhref");
    var returnStatus = base.getUrlParam("return");
    var code = base.getUrlParam("code");
    var bankName = "";

    init();

    function init(){
        base.showLoading();
        if(code){
            $("title").html("修改银行卡");
        	getBankCard().done(getBankList());
        }else{
        	$("title").html("新增银行卡");
        	getBankList();
        }
        addListeners();

    }
    // 详情查询银行卡
    function getBankCard(){
        return UserCtr.getBankCard(code)
            .then(function(data){
    			$("#realName").val(data.realName).attr("disabled","disabled");
	    	 	$("#subbranch").val(data.subbranch);
	    	 	$("#bankcardNumber").val(data.bankcardNumber);
	    	 	$("#bindMobile").val(data.bindMobile);
	    	 	$("#bankNameSpan").html(data.bankName);
                $("#bankCode").val(data.bankCode);
	    	 	bankName = data.bankName;
            	$("#bankName option").each(function(){
	            	if($(this).val() == data.bankName){
	            		$(this).attr("selected", true).siblings().attr("selected", false);
	            	}
		        });
        	});
    }
    // 列表查询银行的数据字典
    function getBankList(){
        UserCtr.getBankList().then(function(data){
            base.hideLoading();
            var html = '<option>请选择</option>';
            for(var i = 0; i < data.length; i++) {
            	if(code && bankName == data[i].bankName){
            		html += `<option selected value="${data[i].bankName}" code="${data[i].bankCode}">${data[i].bankName}</option>`;
            	}else{
            		html += `<option value="${data[i].bankName}" code="${data[i].bankCode}">${data[i].bankName}</option>`;
            	}
            }
            $("#bankName").html(html);
        });
    }

    function addListeners(){
        $("#bankCardForm").validate({
            'rules': {
                realName: {
                    required: true,
                    isNotFace: true,
                    maxlength: 16
                },
                bankName: {
                    required: true
                },
                subbranch: {
                    required: true,
                    isNotFace: true,
                    maxlength: 255
                },
                bindMobile: {
                    required: true,
                    mobile: true
                },
                bankcardNumber: {
                    required: true,
                    bankCard: true
                }
            },
            onkeyup: false
        });
        $("#sbtn").on("click", function(){
            if($("#bankCardForm").valid()){
            	if($("#bankName").val() == "请选择"){
            		base.showMsg("请选择银行名称")
            	}else{
            		addOrEditBankCard();
            	}

            }
        });
        $("#bankName").on("change", function(){
            $("#bankNameSpan").html($("#bankName").val())
            $("#bankCode").val($("#bankName option:selected").attr("code"));
        });
    }

    function addOrEditBankCard(){
        base.showLoading("保存中...");
        var param = $("#bankCardForm").serializeObject();
        param.realName=$("#realName").val();

        var successMsg = "添加银行卡成功";
        if(code){
        	param.status = "1";
        	param.code = code;
        	successMsg = "修改银行卡成功";
        }
        UserCtr.addOrEditBankCard(param)
            .then(function(){
                base.hideLoading();
                base.showMsg(successMsg);
                setTimeout(function(){
                	if(returnStatus){
                		location.replace(returnUrl);
                	}else{
                		location.replace(document.referrer);
                	}
                }, 1000);
            });
    }
})
