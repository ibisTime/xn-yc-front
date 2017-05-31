define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/module/loadImg/loadImg'
], function(base, Ajax, Dict, loadImg) {
    var config = {
            limit: 10,
            start: 1,
            userId: base.getUserId(),
            status:1
        },
        imgWidth = (($(window).width() - 20) / 3) + "px",
        first, isEnd, index = base.getUrlParam("i") || 0,
        canScrolling,
        dictData,dictDataC,
        price=0,
        rate=1;

    initView();

    function initView() {
    	$.when(
    		base.getDictList("808907","store_purchase_status"),
    		base.getDictList("802006","currency")
    	).then(function(res,res2){
    		dictData = res.data;
    		dictDataC = res2.data;
    		addListener()
    	})
        
    }

    function addListener() {
    		config.start = 1;
            first = true;
            isEnd = false;
            canScrolling = false;
            $("#ol-ul").empty();
            $("#noItem").addClass("hidden");
            addLoading();
            getOrderList();
        $(window).on("scroll", function() {
            var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getOrderList();
            }
        });
        $("#ol-ul").on("click", "li span.ol-tobuy", function(e) {
            e.stopPropagation();
            e.preventDefault();
            var me = $(this);
            location.href = "../detail/recharge_cardPay.html?code=" + me.closest("li[code]").attr("code");
        });
    }

    function getOrderList() {
        Ajax.post("808245", {json: config})
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        html = "",
                        totalCount = +data.totalCount,
                        curList = data.list;
                    if (totalCount <= config.limit || curList.length < config.limit) {
                        isEnd = true;
                    }
                    if (curList.length) {
                        curList.forEach(function(cl) {
                            var invoice = cl,
                                totalAmount = cl.amount2,
                                totalJFAmount = cl.amount3,
                                code = cl.code;
                             
                            html += '<li class="clearfix b_bd_b b_bd_t bg_fff mb10" code="' + code + '">' +
                                '<div class="show plr10">' +
                                '<div class="wp100 b_bd_b clearfix ptb10">' +
                                '<div class="fl">订单号：<span>' + code + '</span></div></div>'+
                            	'<div class="wp100 clearfix ptb4 p_r min-h100p">' +
                                '<div class="order-img-wrap mt10 tc default-bg" style="width:80px;height:80px;"><img class="center-img1" src="' + base.getImg(invoice.store.advPic) + '"></div>' +
                                '<div class="pl100 clearfix"><div class="fl wp100 pt12">' +
                                '<p class="tl line-tow">商家名称：' + invoice.store.name + '</p>' ;
                            if(invoice.payAmount2){
                            	html+='<p class="tl line-tow">消费金额：' + invoice.payAmount2/1000 + '橙券</p>' ;
                            	
                            }else if(invoice.payAmount1){
                            	html+='<p class="tl line-tow">消费金额：' + invoice.payAmount1/1000 + '元</p>' +
                            		'<p class="tl line-tow">返橙券：' + invoice.backAmount/1000 + '橙券</p>';
                            }

                            html+='<p class="tl line-tow">时间：' + base.formatDate(invoice.createDatetime,"yyyy-MM-dd hh:mm:ss") + '</p>' +
                                '</div></div>' +
	                            '<div class="wp100 clearfix ptb6 mt1emys">' +
	                            '<span class="fr inline_block bg_f64444 t_white s_10 plr8 ptb4 b_radius4">' + base.getDictListValue(invoice.status,dictData) + '</span>' +
	                            '</div></div>' +
	                            '</div></li>';
                            
                            
                        });
                        removeLoading();
                        $("#ol-ul").append(loadImg.loadImg(html));
                        config.start += 1;
                        canScrolling = true;
                    } else {
                        if (first) {
                            doError();
                        } else {
                            removeLoading();
                        }
                    }
                } else {
                    if (first) {
                        doError();
                    } else {
                        removeLoading();
                    }
                }
                first = false;
            });
    }

    function addLoading() {
        $("#ol-ul").append('<li class="scroll-loadding"></li>');
    }

    function removeLoading() {
        $("#ol-ul").find(".scroll-loadding").remove();
    }

    function doError() {
        $("#ol-ul").empty();
        $("#noItem").removeClass("hidden");
        canScrolling = false;
    }

});
