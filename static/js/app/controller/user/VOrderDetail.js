define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/util/dialog',
    'Handlebars',
    'app/module/loadImg/loadImg'
], function(base, Ajax, Dict, dialog, Handlebars, loadImg) {
    $(function() {
        var code = base.getUrlParam('code'),
            receiptType = Dict.get("receiptType"),
            fastMail = Dict.get("fastMail"),
            addrTmpl = __inline("../../ui/order-detail-addr.handlebars"),
            dictData,
            price=0,
            rate=1;


		base.getDictList("808907","vorder_status").then(function(res){
    		dictData = res.data;
    		initView();
    	})
        

        function initView() {
            $("#orderCode").text(code);
            //查询订单
            (function() {
                var config = {
                        "code": code
                    };
                var modelCode = "",
                    modelName, quantity, salePrice, receiveCode, productName;
                Ajax.get("808666", config)
                    .then(function(response) {
                        $("#cont").remove();
                        if (response.success) {
                            var data = response.data,
                                html = "",
                                product = data.product;
								
								price = data.amount/1000;
								rate= data.product.rate;
								
                            $("#orderDate").text(getMyDate(data.applyDatetime));
                            $("#orderStatus").text(base.getDictListValue(data.status,dictData));
                            /*
                                "1": "待支付",
                                "2": "待发货",
                                "3": "待收货",
                                "4": "已收货",
                                "91": "用户取消",
                                "92": "商户取消",
                                "93": "快递异常"
                            */
                            //待支付(可取消)
                            if (data.status == "0") {
                                $("footer").removeClass("hidden");
                                //取消订单
                                $("#cbtn").on("click", function(e) {
                                    $("#od-mask, #od-tipbox").removeClass("hidden");
                                });
                                //支付订单
                                $("#sbtn").on("click", function() {
                                	
                                    location.href = '../detail/recharge_cardPay.html?code=' + code+"&a="+price+"&rate="+rate;
                                });
                                addListener();
                            }
                            //备注
                            if (data.applyNote) {
                                $("#applyNoteTitle, #applyNoteInfo").removeClass("hidden");
                                $("#applyNoteInfo").text(data.applyNote);
                            }
                            //商品信息
                            var text1 = "加油卡号：",
                                text2 = "加油姓名：";
                                
                            if(data.product.type==3){
                                text1 = "手机号：";
                                text2 = "姓名：";
                            }
                            
                            var html = '<ul>';
                                html += '<ul>' +
                                    '<li class="ptb8 clearfix b_bd_b" modelCode="' + data.product.code + '">' +
                                    '<a class="show p_r min-h100p" href="../detail/recharge_cardDetail.html?code=' + data.product.code + '">' +
                                    '<div class="order-img-wrap ml10 tc default-bg mr10"><img class="center-img1" src="' + base.getImg(data.product.advPic) + '"/></div>' +
                                    '<div class="order-right-wrap clearfix"><div class="fl wp100 plr10">' +
                                    '<p class="tl line-tow pt10">' + text1 + data.reCardno + '</p>' +
                                    '<p class="tl line-tow pt6">' + text2  + data.reName + '</p>' +
                                    '<p class="tl line-tow pt6">充值面额：' + data.amount/1000 + '</p>' +
                                    '</div></div>' ;
                            html += '</a></li></ul>';

                            $("#od-ul").append(loadImg.loadImg(html));
                            $("#totalAmount").html(base.formatMoney(data.amount*data.product.rate)+"橙券");
                            
                            $("#od-id").html(data.code);
                            
                        } else {
                            showMsg("暂时无法获取订单信息！");
                        }
                    });
            })();
        }
        //日期格式
        function getMyDate(value) {
            var date = new Date(value);
            return date.getFullYear() + "-" + get2(date.getMonth() + 1) + "-" + get2(date.getDate()) + " " +
                get2(date.getHours()) + ":" + get2(date.getMinutes()) + ":" + get2(date.getSeconds());
        }
        //把一位数变成两位数
        function get2(val) {
            if (val < 10) {
                return "0" + val;
            } else {
                return val;
            }
        }

        function addListener() {
            //取消订单确认框点击确认
            $("#odOk").on("click", function() {
                cancelOrder();
                $("#od-mask, #od-tipbox").addClass("hidden");
            });
            //取消订单确认框点击取消
            $("#odCel").on("click", function() {
                $("#od-mask, #od-tipbox").addClass("hidden");
            });
        }

        function trimStr(val) {
            if (val == undefined || val === '') {
                return '';
            }
            return val.replace(/^\s*|\s*$/g, "");
        }

        function cancelOrder() {
        	dCode = [];
        	dCode.push(code)
            var config = {
                    json: {
                        codeList: dCode,
                        remark:'用户自行取消',
                        updater: base.getUserId()
                    }
                };
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post("808652", config)
                .then(function(response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        showMsg("取消订单成功！");
                        setTimeout(function() {
                            base.getBack();
                        }, 1000);
                    } else {
                        showMsg(response.msg);
                    }
                });
        }

        function showMsg(cont) {
            var d = dialog({
                content: cont,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, 2000);
        }
    });
});
