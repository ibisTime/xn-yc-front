define([
    'app/controller/base',
    'swiper',
    'app/module/weixin',
    'app/module/addSub',
    'app/interface/MallCtr'
], function(base, Swiper, weixin, addSub, MallCtr) {
    var rspData,
        code = base.getUrlParam("code"),
        productSpecsCode,
        quantity = 1,
        code2productSpecs = {};

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
        var _popCont = $("#popCont");
        // 点击购买，弹出规格选择框
        $("#buyBtn").click(function() {
            _popCont.removeClass("hide").addClass("show");
        });
        _popCont.find(".sku-closed").click(function(){
            _popCont.removeClass("show").addClass("hide");
        });

        (function(){
            var _tip = $("#chose-tip"),
                _price = $("#chose-price"),
                _name = $("#chose-name");
            // 选择商品类别
            _popCont.find("ul").on("click", "li", function(){
                var self = $(this);
                self.removeClass("normal").addClass("sel")
                    .siblings(".sel").removeClass("sel").addClass("normal");
                _tip.empty();
                _name.text("已选：" + self.text());
                productSpecsCode = self.attr("code");

                var productSpecs = code2productSpecs[productSpecsCode];
                var price2 = base.formatMoneyD(productSpecs.price2) + "橙券",
                    price1 = base.formatMoneyD(productSpecs.price1) + "元";
                _price.text(price2 + "/" + price1);
            });
        })();
        // 购买
        $("#pop-buy").click(function(){
            if(!productSpecsCode){
                base.showMsg("未选择商品");
                return;
            }
            // 果树认购
            if(rspData.category == GSRG){
                base.showLoading("下单中...");
                MallCtr.submitOrder({
                    productSpecsCode,
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
                location.href = `./submit_order.html?code=${code}&q=${quantity || 1}&spec=${productSpecsCode}`;
            }
        });

        addSub.createByEle({
            sub: $("#subCount"),
            add: $("#addCount"),
            input: $("#buyCount"),
            changeFn: function () {
                quantity = this.value;
            }
        });
    }

    //生成页面
    function addHtml() {
        var msl = rspData,
            pics = msl.pic,
            html = "",
            productSpecsList = msl.productSpecsList;

        pics = pics.split("||");
        $.each(pics, function(i, val) {
            html += '<div class="swiper-slide tc"><img src="' + base.getImg(val, 1) + '"></div>';
        });
        $("#btlImgs").html(html);
        new Swiper('.swiper-container', {
            'direction': 'horizontal',
            'pagination': '.swiper-pagination'
        });

        $("#btr-name").text(msl.name);
        $("#btr-slogan").text(msl.slogan);
        var price2 = base.formatMoneyD(msl.price2) + "橙券",
            price1 = base.formatMoneyD(msl.price1) + "元";
        $("#discountPrice").text(price2);
        $("#cnyPrice").text("/" + price1);
        $("#chose-price").text(price2 + "/" + price1);
        $("#btr-description").append(msl.description);

        // 配送计划 或 果树认购
        if(msl.category == PSJH || msl.category == GSRG){
            $("#btr-desc").removeClass("hidden").html(msl.strain + " | " + msl.logisticsDate);
        }
        html = "";
        productSpecsList.forEach(function(productSpecs){
            code2productSpecs[productSpecs.code] = productSpecs;
            html += `<li class="normal" code="${productSpecs.code}">${productSpecs.name}</li>`;
        });
        $("#chose-img").html(`<img src="${base.getImg(msl.advPic, 1)}"/>`)
        $("#productSpecs").html(html);
    }
});
