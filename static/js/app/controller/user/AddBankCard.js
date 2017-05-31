define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
	
    var returnUrl = sessionStorage.getItem("returnhref");
    var returnStatus = base.getUrlParam("return");
    var code = base.getUrlParam("code")||"";
    var bizCode = code?"802012":"802010";
    var bankName="";
    
    //修改
	
    init();
    
    function init(){
        loading.createLoading();
        
        $("#userId").val(base.getUserId());
        if(code){
        	$.when(
        		getDetail(),
        		$("title").html("修改银行卡")
        	).done(getBankCode())
        }else{
        	
        	$("title").html("新增银行卡")
        	getBankCode();
        }
        addListeners();
        
    }
    
    function getDetail(){
    	Ajax.get("802017",{
    	 	"code":code
    	}).then(function(res){
    		if(res.success){
    			$("#realName").val(res.data.realName).attr("disabled","disabled");
	    	 	$("#subbranch").val(res.data.subbranch);
	    	 	$("#bankcardNumber").val(res.data.bankcardNumber);
	    	 	$("#bindMobile").val(res.data.bindMobile);
	    	 	$("#bankNameSpan").html(res.data.bankName);
	    	 	bankName=res.data.bankName;
            	$("#bankName option").each(function(){
	            	if($(this).val()==res.data.bankName){
	            		$(this).attr("selected",true).siblings().attr("selected",false)
	            	}
		        })
	    	 	
    		}else{
                base.showMsg(res.msg);
            }
    	 	
    	});
    }
    
    function getBankCode(){
        Ajax.get("802116").then(function(res){
            loading.hideLoading();
            if(res.success){
                var html = "";
                html += '<option>请选择</option>';
                for(var i = 0;i < res.data.length ; i++) {
                	if(code&&bankName==res.data[i].bankName){
                		html += '<option selected value="'+res.data[i].bankName+'" code="'+res.data[i].bankCode+'">'+res.data[i].bankName+'</option>';
                	}else{
                		html += '<option value="'+res.data[i].bankName+'" code="'+res.data[i].bankCode+'">'+res.data[i].bankName+'</option>';
                	}
                }
                
                $("#bankName").html(html);
            }else{
                base.showMsg(res.msg);
            }
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
            	if($("#bankName").val()=="请选择"){
            		base.showMsg("请选择银行名称")
            	}else{
            		addBankCard(bizCode);
            	}
                
            }
        });
        $("#bankName").on("change", function(){
            $("#bankNameSpan").html($("#bankName").val())
            $("#bankCode").val($("#bankName option:selected").attr("code"));
        });
    }
    
    function addBankCard(b){
        loading.createLoading("保存中...");
        var param = $("#bankCardForm").serializeObject();
        param.realName=$("#realName").val();
        
        var successMsg = "添加银行卡成功";
        if(code){
        	param.status="1";
        	param.code=code;
        	successMsg = "修改银行卡成功";
        }
        Ajax.post(b, {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    base.showMsg(successMsg);
                    setTimeout(function(){
                    	if(returnStatus){
                    		location.replace(returnUrl);
                    	}else{
                    		location.replace(document.referrer);
                    	}
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            });
    }
})
