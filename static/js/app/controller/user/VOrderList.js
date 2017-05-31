define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/module/loadImg/loadImg',
], function(base, Ajax, Dict, loadImg) {
    $(function() {
        var config = {
                limit: 10,
                start: 1,
                applyUser: base.getUserId()
            },
            imgWidth = (($(window).width() - 20) / 3) + "px",
            first, isEnd, index = base.getUrlParam("i") || 0,
            canScrolling,
            dictData,
            price=0,
            rate=1;
		
		
        initView();

        function initView() {
        	base.getDictList("808907","vorder_status").then(function(res){
        		dictData = res.data;
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
                location.href = "../detail/recharge_cardPay.html?code=" + me.closest("li[code]").attr("code")+"&a="+me.closest("li[code]").attr("price")+"&rate="+me.closest("li[code]").attr("rate");
            });
        }

        function getOrderList() {
            Ajax.post("808668", {json: config})
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
                                    code = cl.code,
                                    text1 = "加油卡号：",
                                    text2 = "加油姓名：";
                                 
                                if(invoice.product.type==3){
                                    text1 = "手机号：";
                                    text2 = "姓名：";
                                }
                                
                                html += '<li class="clearfix b_bd_b b_bd_t bg_fff mb10" code="' + code + '" price="' + invoice.amount/1000 + '" rate="' + invoice.product.rate + '">' +
                                    '<a class="show plr10" href="./vorder_detail.html?code=' + code + '" class="show">' +
                                    '<div class="wp100 b_bd_b clearfix ptb10">' +
                                    '<div class="fl">订单号：<span>' + code + '</span></div>' +
                                    '</div>';
                                
                                html += '<div class="wp100 clearfix ptb4 p_r min-h100p">' +
                                    '<div class="order-img-wrap ml10 tc default-bg"><img class="center-img1" src="' + base.getImg(invoice.product.advPic) + '"></div>' +
                                    '<div class="order-right-wrap clearfix"><div class="fl wp100 pt12">' +
                                    '<p class="tl line-tow">' + text1 + invoice.reCardno + '</p>' +
                                    '<p class="tl line-tow">' + text2 + invoice.reName + '</p>' +
                                    '<p class="tl line-tow">充值面额：' + invoice.amount/1000 + '</p>' +
                                    '</div></div>' +
	                                '<div class="wp100 clearfix ptb6 mt1emys">' +
	                                '<span class="fr inline_block bg_f64444 t_white s_10 plr8 ptb4 b_radius4 ' + (invoice.status == "0" ? "ol-tobuy" : "") + '">' + base.getDictListValue(invoice.status,dictData) + '</span>' +
	                                '</div></div>' +
	                                '</a></li>';
                                
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
});
