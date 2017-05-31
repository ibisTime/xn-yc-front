define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'Handlebars'
], function (base, Ajax, dialog, Handlebars) {
	var userId = sessionStorage.getItem("userId");
	var token = sessionStorage.getItem("token");
	var url = "805165",
		code = base.getUrlParam("c"),
        returnUrl = sessionStorage.getItem("returnhref"),
        contentTmpl = __inline("../../ui/address-items.handlebars");
    var returnStatus = base.getUrlParam("return");
	var param = {
			"userId": userId,
			"token":token,
			"isDefault": ""
		};
    Ajax.post(url, {json:param})
        .then(function(response){
        	$("#cont").remove();
            if(response.success){
                var data = response.data,
                    html = "";
                if(data.length){
                	var html = contentTmpl({items: data});
                	$("#addressDiv").append(html);
                		
//              	$("#addressDiv").find("a[code='"+code+"'] .radio-tip").addClass("active");
            		data.forEach(function(v, i){
            			if(v.isDefault == 1){
            				$("#addressDiv").find(".z_index0").eq(i).children("div").children(".radio-tip").addClass("active")
            			}
            		})
            	
                	$("footer").removeClass("hidden");
                }else{
                    doError("#addressDiv", 1);
                }
            }else{
            	doError("#addressDiv");
            	base.showMsg(response.msg)
            }
        });
    $("#addressDiv").on("click", "div div .radio-tip", function(){
    	var me = $(this).siblings("a");
        $("#loaddingIcon").removeClass("hidden");
        
		var config = {
			"userId": userId,
			"addressee": me.find(".a-addressee").text(),
            "mobile": me.find(".a-mobile").text(),
            "province": me.find(".a-province").text(),
            "city": me.find(".a-city").text(),
            "district": me.find(".a-district").text(),
            "detailAddress": me.find(".a-detailAddress").text(),
            "isDefault": "1",
            "code": me.attr("code")
        };
        
        Ajax.post("805163", {json:config})
            .then(function (response) {
                if(response.success){
                	
                    $("#loaddingIcon").addClass("hidden");
                	if(returnStatus){
                		location.href = returnUrl;
                	}else{
                		//选择刷新当前页
                		location.reload(true);
                	}
                }else{
                    $("#loaddingIcon").addClass("hidden");
                }
            });
    })
    
    $("#addressDiv").on("click", "a", function(){
        var thisCode = $(this).attr("code");
        if(code){
    		location.href = "./add_address.html?eCode="+thisCode+"&return=1";
    	}else{
    		location.href = "./add_address.html?eCode="+thisCode;
    	}
    });

    $("#addressDiv").on("touchstart", ".addr_div", function(e){
    	e.stopPropagation();
    	var touches = e.originalEvent.targetTouches[0],
    		me = $(this);
    	var left = me.offset().left;
    	me.data("x",touches.clientX);
    	me.data("offsetLeft", left);
    });
    $("#addressDiv").on("touchmove", ".addr_div", function(e){
    	e.stopPropagation();
    	var touches =  e.originalEvent.changedTouches[0],
    		me = $(this),
            ex = touches.clientX,
            xx = parseInt(me.data("x")) - ex,
    	    left = me.data("offsetLeft");
        if( xx > 10 ){
        	me.css({
        		"transition": "none",
        		"transform": "translate3d("+(-xx/2)+"px, 0px, 0px)"
        	});
        }else if(xx < -10){
        	var left = me.data("offsetLeft");
        	me.css({
        		"transition": "none",
        		"transform": "translate3d("+(left + (-xx/2))+"px, 0px, 0px)"
        	});
        }
    });
    $("#addressDiv").on("touchend", ".addr_div", function(e){
    	e.stopPropagation();
    	var me = $(this);
        var touches = e.originalEvent.changedTouches[0],
            ex = touches.clientX,
            xx = parseInt(me.data("x")) - ex;
    	if( xx > 56 ){
    		me.css({
        		"transition": "-webkit-transform 0.2s ease-in",
        		"transform": "translate3d(-56px, 0px, 0px)"
        	});
        }else{
        	me.css({
        		"transition": "-webkit-transform 0.2s ease-in",
        		"transform": "translate3d(0px, 0px, 0px)"
        	});
        }
    });
    var currentElem;
    $("#addressDiv").on("click", ".al_addr_del", function(e){
    	e.stopPropagation();
    	currentElem = $(this);
    	$("#od-mask, #od-tipbox").removeClass("hidden");
    });

    $("#sbtn").on("click", function(){
    	if(code){
    		location.href = "./add_address.html?return=1";
    	}else{
    		location.href = "./add_address.html";
    	}
    	
    });

    $("#odOk").on("click", function(){
    	deleteAddress();
    	$("#od-mask, #od-tipbox").addClass("hidden");
    })
    $("#odCel").on("click", function(){
    	$("#od-mask, #od-tipbox").addClass("hidden");
    })

    function deleteAddress(){
    	$("#loaddingIcon").removeClass("hidden");
		param1 = {
			"code": currentElem.prev().find("a").attr("code"),
			"token": token
		}
		Ajax.post("805161", {json:param1})
			.then(function (response) {
				$("#loaddingIcon").addClass("hidden");
			    if(response.success){
			    	var addrD = $("#addressDiv");
			    	if(addrD.children("div").length == 1){
			    		doError("#addressDiv", 1);
			    	}else{
			    		var $parent = currentElem.parent();

				    	if(currentElem.prev().find(".radio-tip.active").length){
				    		if(!$parent.index()){
				    			$parent.next().find(".radio-tip").addClass("active");
				    		}else{
				    			addrD.children("div:first").find(".radio-tip").addClass("active");
				    		}
				    	}
				    	$parent.remove();
			    	}
			    	showMsg('收货地址删除成功！');
				}else{
					showMsg('收货地址删除失败！');
				}
		});
    }

    function showMsg(cont){
        var d = dialog({
                    content: cont,
                    quickClose: true
                });
        d.show();
        setTimeout(function () {
            d.close().remove();
        }, 2000);
    }

    function doError(cc, flag) {
    	var msg = "暂时无法获取数据"
    	if(flag){
    		msg = "暂时没有收货地址";
    		$("footer").removeClass('hidden');
    	}
        $(cc).replaceWith('<div class="bg_fff" style="text-align: center;line-height: 150px;">'+msg+'</div>');
    }
});
