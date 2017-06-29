define([
    'app/controller/base',
    'swiper',
    'app/module/weixin',
    'app/interface/MallCtr'
], function(base, Swiper, weixin, MallCtr) {
    var mySwiper,
        rspData,
        user,
        code = base.getUrlParam("code");

    init();

    function init() {
        base.showLoading();
        getDetail();
    }
    // 获取商品详情
    function getDetail() {
        MallCtr.getProduct(code).then(function(data) {
            base.hideLoading();
            rspData = data;
            weixin.initShare({
                title: data.name,
                desc: data.slogan,
                link: location.href,
                imgUrl: base.getShareImg(data.pic)
            });
            addListeners();
            addHtml();
            $("#cont").remove();
        });
    }
    function addListeners() {
        // 购买
        $("#buyBtn").click(function() {
            if (!$(this).hasClass("no-buy-btn")) {
                if(rspData.category == "FL2017062717580920664616"){
                    base.showLoading("下单中...");
                    MallCtr.submitOrder({
                        productSpecsCode: rspData.productSpecsList[0].code,
                        quantity: 1,
                        toUser: SYSTEM_USERID,
                        pojo: {
                            applyUser: base.getUserId(),
                            companyCode: SYSTEM_CODE,
            	            systemCode: SYSTEM_CODE
                        }
                    }).then((data) => {
                        base.hideLoading();
                        var code = data.code || data;
                        location.href = '../pay/pay_order.html?code=' + code;
                    });
                }else{
                    location.href = "./submit_order.html?code=" + code + "&q=" + $("#buyCount").val();
                }
            }
        });
        $("#subCount").on("click", function() {
            var orig = $("#buyCount").val();
            if (orig == undefined || orig == "" || orig == "0" || orig == "1") {
                orig = 2;
            }
            orig = +orig - 1;
            $("#buyCount").val(orig);
            $("#buyCount").change();

            var msl = rspData;
            var buyCount = $("#buyCount").val();
            var CB = (msl.price2 / 1000) * buyCount + "橙券";
            var rmb = (msl.price1 / 1000) * buyCount + "元";

            $(".CB").html(CB + "/" + rmb);
        });
        $("#addCount").on("click", function() {
            var orig = $("#buyCount").val();
            if (orig == undefined || orig == "") {
                orig = 0;
            }
            orig = +orig + 1;
            $("#buyCount").val(orig);
            $("#buyCount").change();

            var msl = rspData;
            var buyCount = $("#buyCount").val();
            var CB = (msl.price2 / 1000) * buyCount + "橙券";
            var rmb = (msl.price1 / 1000) * buyCount + "元";

            $(".CB").html(CB + "/" + rmb);

        });
        $("#buyCount").on("keyup", function(e) {
            var keyCode = e.charCode || e.keyCode;
            var me = $(this);
            if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                me.val(me.val().replace(/[^\d]/g, ""));
            }
            if (!me.val()) {
                me.change();
            }
        }).on("change", function(e) {
            var keyCode = e.charCode || e.keyCode;
            var me = $(this);
            if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                me.val(me.val().replace(/[^\d]/g, ""))
            }
            if (!me.val()) {
                me.val("1");
            }
            if (me.val() == "0") {
                me.val("1");
            }
        });
    }

    //生成页面
    function addHtml() {
        var msl = rspData,
            pics = msl.pic;

        pics = pics.split("||");
        if (!mySwiper) {
            var html = "";
            $.each(pics, function(i, val) {
                html += '<div class="swiper-slide tc"><img src="' + base.getImg(val, 1) + '"></div>';
            })
            $("#btlImgs").append(html);
            mySwiper = new Swiper('.swiper-container', {
                'direction': 'horizontal',
                'pagination': '.swiper-pagination'
            });
        }
        $("#btr-name").text(msl.name);
        $("#btr-slogan").text(msl.slogan);

        var price2 = msl.price2 / 1000 + "橙券",
            price1 = msl.price1 / 1000 + "元";
        $("#discountPrice").text(price2);
        $("#cnyPrice").text(price1);

        $("#btr-description").append(msl.description);

        var buyCount = $("#buyCount").val();

        if(msl.category == "FL2017062716471159133341" || msl.category == "FL2017062717580920664616"){
            buyCount = 1;
            $("#operatorWrap").hide();
            $("#btr-desc").removeClass("hidden").html(msl.strain + " | " + msl.logisticsDate);
        }

        var CB = (msl.price2 / 1000) * buyCount + "橙券";
        var rmb = (msl.price1 / 1000) * buyCount + "元";

        $(".CB").html(CB + "/" + rmb);
    }

    function isNumber(code) {
        if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
            return true;
        }
        return false;
    }

    function isSpecialCode(code) {
        if (code == 37 || code == 39 || code == 8 || code == 46) {
            return true;
        }
        return false;
    }
});
