define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loadImg/loadImg'
], function(base, Ajax, loadImg) {
	var code = base.getUrlParam("code");
	var price = 0,rate = 1;
	
    init();
	
    function init() {
    	addListeners();
    	$("#cardPrice").on("click","li",function(){
    		
			var totalAmount = 0;
			var priceThis = 0;
    		var priceTml = 0;
			
    		if($(this).hasClass("active")){
    			$(this).removeClass("active")
    		}else{
    			$(this).addClass("active")
    		}
    		
    		//计算价格
    		$("#cardPrice li").each(function(){
    			if($(this).hasClass("active")){
    				priceThis = parseInt($(this).attr("data-price"));
    				priceTml += priceThis;
    				totalAmount += priceThis*1000*rate;
    			}
    			
    			price = priceTml;
    			
				$("#totalAmount").text(base.formatMoneyD(totalAmount));
    		})
    		
    	})
    	
    	$("#sbtn").click(function(){
    		
    		var cardNum = $("#cardNum").val()
    		var cardName = $("#cardName").val();
    		var totalAmount = $("#totalAmount").text();
    		
    		if($(".cardNum").html()=="手机号"){
    			var mobileStyle = /^1[3|4|5|7|8]\d{9}$/;
    			
    			if(!cardNum){
	    			base.showMsg("请输入手机号");
	    			return;
	    		}else if(!mobileStyle.test(cardNum)){
	    			base.showMsg("请输入正确的手机号");
	    			return;
	    		}
    		}
    		
    		if(!cardNum){
    			base.showMsg("请输入卡号")
    		}else if(!cardName){
    			base.showMsg("请输入姓名")
    		}else if(totalAmount==0){
    			base.showMsg("请选择充值面额")
    		}else{
    			$("#loaddingIcon").removeClass("hidden");
    			var parem = {
	    			"vproductCode": code,
				    "reCardno": cardNum,
				    "reName": cardName,
				    "reMobile": "0",
				    "amount": price*1000,
				    "applyUser": base.getUserId()
	    		}
	    		
	    		Ajax.post("808650",{
	    			json:parem
	    		}).then(function(res){
	    			if(res.success){
	    				$("#loaddingIcon").addClass("hidden");
	    				location.href="recharge_cardPay.html?code="+res.data.code+"&a="+price+"&rate="+rate;
	    			}else{
	    				
	    				$("#loaddingIcon").addClass("hidden");
	    				base.showMsg(res.msg)
	    			}
	    		})
    		}
    		
    	})
    }

    function addListeners() {
    	Ajax.get("808616",{
    		"code":code
    	}).then(function(res){
    		if(res.success){
    			var data = res.data;
    			var cardNumList = data.price;
    			
		    	var strs= []; //定义一数组 
				var s = "";
				strs=cardNumList.split(","); //字符分割
				
				for (i=0;i<strs.length ;i++ ) { 
					s+='<li data-price="'+strs[i]+'">'+strs[i]+'元</li>';
				}
				
    			if(data.type == "3"){
					$(".cardNum").html("手机号");
					$("#cardNum").attr("type","tel");
					$("#cardNum").attr("pattern","[0-9]*");
					$("#cardNum").attr("placeholder","请输入手机号");
				}else{
					$(".cardNum").html("加油卡号")
				}
    			rate = data.rate;
    			$("#cardPrice").html(loadImg.loadImg(s))
    			
    			$("#pic").attr("src",base.getImg(data.pic, 1));
    			$("#name").html(data.name);
    			$("#slogan").html(data.description+data.description+data.description+data.description+data.description);
    			$("#loaddingIcon").addClass("hidden");
    		}else{
    			
	    		$("#loaddingIcon").addClass("hidden");
    			base.showMsg(res.msg)
    		}
    	})
    }

});
