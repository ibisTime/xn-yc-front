define([
    'app/controller/base',
    'app/util/dict',
    'Handlebars',
    'app/module/loadImg',
    'app/interface/MallCtr'
], function(base, Dict, Handlebars, loadImg, MallCtr) {
    var code = base.getUrlParam('code'),
        receiptType = Dict.get("receiptType"),
        orderStatus = Dict.get("orderStatus"),
        fastMail = Dict.get("fastMail"),
        addrTmpl = __inline("../../ui/order-detail-addr.handlebars");

    init();

    function init() {
        $("#orderCode").text(code);
        base.showLoading();
        getOrder().then(base.hideLoading);
    }
    //查询订单
    function getOrder() {
        return MallCtr.getOrder(code).then(function(data) {
            var productSpecs = data.productSpecs;
            $("#orderDate").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm:ss"));
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
            if (data.status == "92") {
                $("#remake").text(data.remark);
                $(".remake-wrap").removeClass("hidden");
            }
            //商品信息
            var html = '<ul><li class="ptb8 clearfix b_bd_b plr10" modelCode="' + productSpecs.productCode + '">' +
                '<a class="show p_r min-h100p" href="../operator/buy.html?code=' + productSpecs.productCode + '">' +
                    '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + base.getImg(data.product.advPic) + '"/></div>' +
                    '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                        '<p class="tl line-tow">' + data.product.name + '</p></div>' +
                        '<div class="fl wp40 tr s_11">'+
                            '<p class="item_totalP">' + base.formatMoneyD(productSpecs.price2) + '橙券</span><br/>或<span class="item_totalP">' + base.formatMoney(productSpecs.price1) + '元</span></p>'+
                            '<p class="t_80">×<span>' + data.quantity + '</span></p>'+
                        '</div>'+
                    '</div></a></li></ul>';

            $("#od-ul").append(loadImg.loadImg(html));

            var CBAmount = base.formatMoney(data.amount2) + "橙券";
            var RMBAmount = base.formatMoney(data.amount1) + "元";
            $("#totalAmount").html(CBAmount + "/" + RMBAmount);

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
                $("#logisticsTime").text(base.formatDate(data.deliveryDatetime, "yyyy-MM-dd hh:mm:ss"));
                $("#logisticsNO").text(data.logisticsCode);
            }
        });
    }
    //确认收货
    function confirmReceipt() {
        base.showLoading("确认中...");
        MallCtr.confirmReceipt(code).then(function() {
            base.hideLoading();
            base.showMsg("确认收货成功！");
            setTimeout(function() {
                base.getBack();
            }, 1000);
        });
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

    function cancelOrder() {
        base.showLoading("取消中...");
        MallCtr.cancelOrder(code).then(function() {
            base.hideLoading();
            base.showMsg("取消订单成功！");
            setTimeout(function() {
                base.getBack();
            }, 1000);
        });
    }
});
