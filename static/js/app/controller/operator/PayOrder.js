define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/module/loadImg/loadImg'
], function(base, Ajax, dialog, loadImg) {
    var code = base.getUrlParam("code") || "";
    var choseIdx = 0;
    var CBAmount,RMBAmount,totalAmount=0;
	
	$.when(
		queryOrder(),
		getAccount(),
    	addListener()
	)
    
    
    //查询订单信息
    function queryOrder() {
        var config = {
                "code": code
            };
        var modelCode = "",
            modelName, quantity, salePrice, receiveCode, productName;
        Ajax.get("808066", config)
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        productOrderList = data.productOrderList;
                    //如果不是待支付订单，则直接跳到个人中心页面
                    if (data.status !== "1") {
                        location.href = "../user/user_info.html";
                    }
                    $("#cont").remove();
                    var cbTotal = 0;
                    
                    //订单相关商品信息
                    if (productOrderList.length) {
                        var html = '';
                        //计算每种商品的总价
                        productOrderList.forEach(function(product) {
                            quantity = +product.quantity;
                            cbTotal += quantity * (+product.price2);
                            
                            html += '<li class="ptb8 clearfix b_bd_b plr10" modelCode="' + product.productCode + '">' +
                                '<a class="show p_r min-h100p" href="../operator/buy.html?code=' + product.productCode + '">' +
                                '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + base.getImg(product.product.advPic) + '"/></div>' +
                                '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                                '<p class="tl line-tow">' + product.product.name + '</p>' +
                                '</div>' +
                                '<div class="fl wp40 tr s_11">';
                                
                            html += '<p class="item_totalP">' + base.formatMoneyD(product.price2) + '橙券</span><br/>或<span class="item_totalP">' + base.formatMoney(product.price1) + '元</span></p>';
                            html += '<p class="t_80">×<span>' + product.quantity + '</span></p></div></div></a></li>'
                            
                        });
                        html += '</ul>';
                        $("#cont").remove();
                        $("footer, #items-cont").removeClass("hidden");
                        $("#items-cont").append(loadImg.loadImg(html));
                        
                        CBAmount=base.formatMoney(data.amount2)+"橙券";
                        RMBAmount=base.formatMoney(data.amount1)+"元";
						$("#totalAmount").html(CBAmount);

                        //添加地址信息
						var addrHtml = '<p><span class="pr2em">总计</span>：<span class="pl_5rem">' + base.formatMoney(data.amount2) + "橙券/" + base.formatMoney(data.amount1) + "元" +  '<span></span></p>' +
                        '<p><span class="pr1em">订单号</span>：<span class="pl_5rem">' + data.code + '</span></p>';
                        
                        if (data.reAddress) {
                            addrHtml += '<p><span>配送信息：</span><span class="pl_5rem">' + data.receiver + '</span><span class="pl10">' + data.reMobile + '</span></p>' +
                                '<p class="pl5_5rem t_73 s_09_5">' + data.reAddress + '</p>';
                        }
                        $("#addressDiv").html(addrHtml);
                        
                    } else {
                        $("#cont").remove();
                        doError("#container");
                    }
                } else {
                    $("#cont").remove();
                    doError("#container");
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
                        rmbRemain = +d.amount;
                        $("#rmbRemain").html("¥" + base.formatMoneyD(d.amount));
                    }else if(d.currency == "CB"){
                        CBRemain = +d.amount;
                        $("#CBRemain").html(base.formatMoneyD(d.amount));
                    }
                })
            }
        });
    }	
	
    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
    }

    function addListener() {
    	$("#content").on("click", ".pay-item", function() {
            var _self = $(this),
                idx = _self.index();
            _self.siblings(".active").removeClass("active");
            _self.addClass("active");
            choseIdx = idx;
            if(choseIdx == 0){  //  橙券余额支付
            	$("#totalAmount").html(CBAmount);
            }else {
                $("#totalAmount").html(RMBAmount);
            }
        });
    	
        /*********支付订单前的确认框start*********/
        //确定支付按钮
        $("#odOk").on("click", function(e) {
            $("#od-mask, #od-tipbox").addClass("hidden");
            if(choseIdx == 0){  //  橙券余额支付
                doPayOrder(50);
            }else if(choseIdx == 1){  //  RMB余额支付
                doPayOrder(1);
            }else { //微信支付
                doPayOrder(5);
            }
            
        });
        $("#odCel").on("click", function(e) {
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
        //取消支付按钮
        /*********支付订单前的确认框end*********/
        //点击支付按钮
        $("#sbtn").on("click", function(e) {
            e.stopPropagation();
            $("#od-mask, #od-tipbox").removeClass("hidden");
        });
    }

    function doPayOrder(payType) {
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post('808052', {
            json:{
                codeList: [code],
                payType: payType
            }
        }).then(function(res) {
            if (res.success) {
            	$("#loaddingIcon").addClass("hidden");
            	if(payType == 50||payType == 1){
            		
                    base.showMsg("支付成功");
                    setTimeout(function(){
                        location.href = "../operator/pay_success.html";
                    }, 1000);
                }else{
                    wxPay(res.data);
                }
                
            } else {
                $("#loaddingIcon").addClass("hidden");
                
                if(res.msg=="橙币不足"){
	                	base.confirm("橙券余额不足，是否前往购买？","否","是").then(function(){
	                        location.href = "../pay/buyCgM.html";
	                	},function(){
//	                        location.href = "../consume/detail.html?c="+code;
	                	})
                }else if(res.msg=="人民币账户余额不足"){
	                	base.confirm("人民币账户余额不足，是否前往购买？","否","是").then(function(){
	                        location.href = "../pay/cny_recharge.html";
	                	},function(){
//	                        location.href = "../consume/detail.html?c="+code;
	                	})
                }else{
                	base.showMsg(res.msg);
                }
//              setTimeout(function() {
//                  location.href = "../user/order_list.html";
//              }, 2000);
            }
        });
    }
    
    var wxConfig = {};

    function onBridgeReady() {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', {
                "appId": wxConfig.appId, //公众号名称，由商户传入
                "timeStamp": wxConfig.timeStamp, //时间戳，自1970年以来的秒数
                "nonceStr": wxConfig.nonceStr, //随机串
                "package": wxConfig.wechatPackage,
                "signType": wxConfig.signType, //微信签名方式：
                "paySign": wxConfig.paySign //微信签名
            },
            function(res) {
                loading.hideLoading();
                // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    base.showMsg("支付成功");
                    setTimeout(function() {
                        location.href = "../consume/detail.html?c="+code;
                    }, 1000);
                } else {
                    base.showMsg("支付失败");
                }
            }
        );
    }
    function wxPay(data){
        wxConfig = data;
        if (data && data.signType) {
            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.removeEventListener("WeixinJSBridgeReady", onBridgeReady);
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                } else if (document.attachEvent) {
                    document.detachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.detachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            } else {
                onBridgeReady();
            }
        } else {
            loading.hideLoading();
            base.showMsg(data.msg || "微信支付失败");
        }
    }
});
