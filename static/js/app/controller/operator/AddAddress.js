define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'Handlebars'
], function (base, Ajax, dialog, Handlebars) {
    $(function () {
    	var userId = base.getUserId();
    	var token = sessionStorage.getItem("token");
        var eCode = base.getUrlParam("eCode");
    	var returnUrl = sessionStorage.getItem("returnhref");
    	var returnStatus = base.getUrlParam("return");
    	var isDefault = 1;
    	
    	addListener();

    	function addListener(){
    		
	        $("#accept_name").on("change", checkAName);
	        $("#mobile").on("change", checkMobile);
	        $("#provinceCode").on("change", checkPCode);
	        $("#cityCode").on("change", checkCCode);
	        $("#districtCode").on("change", checkDCode);
	        $("#street").on("change", checkStreet);
	        $("#sbtn").on("click", function(){
	        	if(valide()){
	        		if(eCode){
	        			addNewAddr("805162",eCode);
	        		}else{
	        			addNewAddr("805160");
	        		}
	        		
	        	}
	        });
	        if(eCode){
	        	getAddress();
	        }
    	}
    	
    	function getAddress(){
    		Ajax.get("805166",{
    			code:eCode
    		}).then(function(res){
    			if(res.success){
    				
    			var addressee = res.data.addressee,
                mobile = res.data.mobile,
                province =  res.data.province,
                city =  res.data.city,
                district =  res.data.district ,
                detailAddress =  res.data.detailAddress;
                if(returnStatus){
                	isDefault = 1;
                }else{
                	isDefault =  res.data.isDefault;
                }
                
                
                $("#accept_name").val(addressee);
                $("#mobile").val(mobile);
                $("#provinceCode").val(province);
                $("#cityCode").val(city);
                $("#districtCode").val(district);
                $("#street").val(detailAddress);
                
    			}else{
    				base.showMsg(res.msg)
    			}
    		})
    	}
    	
    	function addNewAddr(code,edCode){
    		$("#loaddingIcon").removeClass("hidden");
    		if(edCode){
    			var param = {
					"userId": userId,
					"code": edCode,
					"addressee": $("#accept_name").val(),
	                "mobile": $("#mobile").val(),
	                "province": $("#provinceCode").val(),
	                "city": $("#cityCode").val(),
	                "district": $("#districtCode").val(),
	                "detailAddress": $("#street").val(),
	                "isDefault": isDefault
                };
        	}else{
	    		var param = {
					"userId": userId,
					"addressee": $("#accept_name").val(),
	                "mobile": $("#mobile").val(),
	                "province": $("#provinceCode").val(),
	                "city": $("#cityCode").val(),
	                "district": $("#districtCode").val(),
	                "detailAddress": $("#street").val(),
	                "isDefault": isDefault
	            };
       		}
            Ajax.post(code, {json:param})
                .then(function (response) {
                	$("#loaddingIcon").addClass("hidden");
                    if(response.success){
                    	if(returnStatus){
                        	location.href=returnUrl;
                    	}else{
                    		base.getBack();
                    	}
                    	
                    }else{
                        base.showMsg(response.msg)
                    }
                });
    	}

	    function checkAName(){
	    	if($("#accept_name").val() == ""){
	            $("#accept_name").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#accept_name").val().length > 20){
	            $("#accept_name").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkMobile(){
	    	if($("#mobile").val() == ""){
	            $("#mobile").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if(!/^1[3,4,5,7,8]\d{9}$/.test($("#mobile").val())){
	            $("#mobile").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkPCode(){
	    	if($("#provinceCode").val() == ""){
	            $("#provinceCode").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#provinceCode").val().length > 20){
	            $("#provinceCode").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkCCode(){
	    	if($("#cityCode").val() == ""){
	            $("#cityCode").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#cityCode").val().length > 20){
	            $("#cityCode").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkDCode(){
	    	if($("#districtCode").val() == ""){
	            $("#districtCode").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#districtCode").val().length > 20){
	            $("#districtCode").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }
	    function checkStreet(){
	    	if($("#street").val() == ""){
	            $("#street").next().fadeIn(300).fadeOut(2000);
	            return false;
	        }else if ($("#street").val().length > 128){
	            $("#street").next().next().fadeIn(300).fadeOut(2000);
	            return false;
	        }
	        return true;
	    }

    	function valide(){
	        if(checkAName() && checkMobile() && checkPCode() 
	        	&& checkCCode() && checkDCode() && checkStreet()){
	        	return true;
	        }
	        return false;
	    }
    });
});