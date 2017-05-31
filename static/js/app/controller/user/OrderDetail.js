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
            orderStatus = Dict.get("orderStatus"),
            fastMail = Dict.get("fastMail"),
            addrTmpl = __inline("../../ui/order-detail-addr.handlebars");

        initView();

        function initView() {
            $("#orderCode").text(code);
            //查询订单
            (function() {
                var config = {
                        "code": code
                    };
                var modelCode = "",
                    modelName, quantity, salePrice, receiveCode, productName;
                Ajax.get("808066", config)
                    .then(function(response) {
                        $("#cont").remove();
                        if (response.success) {
                            var data = response.data,
                                html = "",
                                productOrderList = data.productOrderList;

                            $("#orderDate").text(getMyDate(data.applyDatetime));
                            $("#orderStatus").text(getStatus(data.status));
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
                            if (data.status == "1") {
                                $("footer").removeClass("hidden");
                                //取消订单
                                $("#cbtn").on("click", function(e) {
                                    $("#od-mask, #od-tipbox").removeClass("hidden");
                                });
                                //支付订单
                                $("#sbtn").on("click", function() {
                                    location.href = '../pay/pay_order.html?code=' + code;
                                });
                                addListener();
                                //待收货
                            } else if (data.status == "3") {
                                $("#qrsh").removeClass("hidden");
                                //确认收货
                                $("#qr_btn").on("click", function() {
                                    confirmReceipt();
                                });
                            }
                            //取消原因备注
                            if (data.status == "92" ) {
                                $("#remake").text(data.remark);
                                $(".remake-wrap").removeClass("hidden");
                            }
                            //商品信息
                            var cnyAmount = 0; //人民币总计
                            if (productOrderList.length) {
                                var html = '<ul>';
                                productOrderList.forEach(function(product) {
                                    html += '<ul>' +
                                        '<li class="ptb8 clearfix b_bd_b plr10" modelCode="' + product.productCode + '">' +
                                        '<a class="show p_r min-h100p" href="../operator/buy.html?code=' + product.productCode + '">' +
                                        '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + base.getImg(product.product.advPic) + '"/></div>' +
                                        '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                                        '<p class="tl line-tow">' + product.product.name + '</p>' +
                                        '</div>' +
                                        '<div class="fl wp40 tr s_11">';
                                    html += '<p class="item_totalP">' + base.formatMoneyD(product.price2) + '橙券</span><br/>或<span class="item_totalP">' + base.formatMoney(product.price1) + '元</span></p>';
                                    html += '<p class="t_80">×<span>' + product.quantity + '</span></p></div></div></a></li>';
                                });
                                html += '</ul>';

                                $("#od-ul").append(loadImg.loadImg(html));
                                
                                var CBAmount=base.formatMoney(data.amount2)+"橙券";
		                        var RMBAmount=base.formatMoney(data.amount1)+"元";
								$("#totalAmount").html(CBAmount+"/"+RMBAmount);
								
								
                                $("#od-id").html(data.code);
                                //地址信息
                                if (data.reAddress) {
                                    $("#addressTitle, #addressDiv").removeClass("hidden");
                                    $("#addressDiv").html(addrTmpl(data));
                                }
                                //物流信息
                                if (data.logisticsCode) {
                                    $("#logisticsTitle, #logisticsInfo").removeClass("hidden");
                                    $("#logisticsComp").text(fastMail[data.logisticsCompany]);
                                    $("#logisticsTime").text(base.formatDate(data.deliveryDatetime,"yyyy-MM-dd hh:mm:ss"));
                                    $("#logisticsNO").text(data.logisticsCode);
                                }
                            } else {
                                showMsg("暂时无法获取商品信息！");
                            }
                        } else {
                            showMsg("暂时无法获取订单信息！");
                        }
                    });
            })();
        }
        //确认收货
        function confirmReceipt() {
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post('808057', {
                json: {
                    code: code,
                    updater: base.getUserId()
                }
            })
                .then(function(response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        showMsg("确认收货成功！");
                        setTimeout(function() {
                            base.getBack();
                        }, 1000);
                    } else {
                        showMsg(response.msg);
                    }
                });
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
        //获取定单状态
        function getStatus(status) {
            return orderStatus[status] || "未知状态";
        }

        function trimStr(val) {
            if (val == undefined || val === '') {
                return '';
            }
            return val.replace(/^\s*|\s*$/g, "");
        }

        function cancelOrder() {
            var config = {
                    json: {
                        code: code,
                        userId: base.getUserId()
                    }
                };
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post("808053", config)
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
