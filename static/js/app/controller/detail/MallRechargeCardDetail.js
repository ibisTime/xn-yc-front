define([
    'app/controller/base',
    'app/module/loadImg',
    'app/interface/MallCtr'
], function(base, loadImg, MallCtr) {
    var code = base.getUrlParam("code");
    var price = 0,
        rate = 1;

    init();

    function init() {
        base.showLoading();
        getDetail();
        addListeners();
    }
    function addListeners() {
        $("#cardPrice").on("click", "li", function() {

            var totalAmount = 0;
            var priceThis = 0;
            var priceTml = 0;

            if ($(this).hasClass("active")) {
                $(this).removeClass("active")
            } else {
                $(this).addClass("active")
            }

            //计算价格
            $("#cardPrice li").each(function() {
                if ($(this).hasClass("active")) {
                    priceThis = parseInt($(this).attr("data-price"));
                    priceTml += priceThis;
                    totalAmount += priceThis * 1000 * rate;
                }
                price = priceTml;
                $("#totalAmount").text(base.formatMoneyD(totalAmount));
            })

        })

        $("#sbtn").click(function() {
            var cardNum = $("#cardNum").val(),
                cardName = $("#cardName").val(),
                totalAmount = $("#totalAmount").text();

            if ($(".cardNum").html() == "手机号") {
                var mobileStyle = /^1[3|4|5|7|8]\d{9}$/;
                if (!cardNum) {
                    base.showMsg("请输入手机号");
                    return;
                } else if (!mobileStyle.test(cardNum)) {
                    base.showMsg("请输入正确的手机号");
                    return;
                }
            }
            if (!cardNum) {
                base.showMsg("请输入卡号");
            } else if (!cardName) {
                base.showMsg("请输入姓名");
            } else if (totalAmount == 0) {
                base.showMsg("请选择充值面额");
            } else {
                base.showLoading("提交中...");
                MallCtr.submitRechargeCardOrder({
                    "vproductCode": code,
                    "reCardno": cardNum,
                    "reName": cardName,
                    "amount": price * 1000
                }).then(function(data) {
                    base.hideLoading();
                    location.replace("recharge_cardPay.html?code=" + data.code + "&a=" + price + "&rate=" + rate);
                })
            }

        })
    }
    function getDetail() {
        MallCtr.getRechargeCard(code)
            .then(function(data) {
                base.hideLoading();
                var cardNumList = data.price,
                    strs = cardNumList.split(","),
                    html = "";
                for (var i = 0; i < strs.length; i++) {
                    html += '<li data-price="' + strs[i] + '">' + strs[i] + '元</li>';
                }
                if (data.type == "3") {
                    $(".cardNum").html("手机号");
                    $("#cardNum").attr("type", "tel").attr("pattern", "[0-9]*").attr("placeholder", "请输入手机号");
                } else {
                    $(".cardNum").html("加油卡号")
                }
                rate = data.rate;
                $("#cardPrice").html(loadImg.loadImg(html))

                $("#pic").attr("src", base.getImg(data.pic, 1));
                $("#name").html(data.name);
                $("#slogan").html(data.description);
            });
    }

});
