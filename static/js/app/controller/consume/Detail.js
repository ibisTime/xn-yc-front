define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/O2OCtr',
    'swiper'
], function(base, Foot, weixin, O2OCtr, Swiper) {
    var code = base.getUrlParam("c"),
        rate2;

    init();

    function init() {
        Foot.addFoot(0);
        if (code) {
            base.showLoading("加载中...", 1);
            business();
            addListeners();
        } else {
            base.showMsg("未传入商家编号!");
        }
    }

    function addListeners() {
        // 埋单
        $("#sbtn").on("click", function() {
            $("#choseDialog").removeClass("hidden");
        });
        // 隐藏弹出框
        $("#choseDialog").click(function() {
            $("#choseDialog").addClass("hidden");
        });
        // 橙券支付
        $("#cqPay").click(function(e) {
            e.stopPropagation();
            location.href = "./integral_consume.html?c=" + code + "&n=" + $("#name").text();
        });
        // 人民币支付
        $("#rmbPay").click(function(e) {
            e.stopPropagation();
            location.href = "../pay/rmb_consume.html?c=" + code + "&rate=" + rate2 + "&n=" + $("#name").text();
        });
    }

    //根据code获取商家信息
    function business() {
        O2OCtr.getBusiness(code)
            .then(function(data) {
                base.hideLoading();
                var dpic = data.pic, strs = dpic.split("||"), html = "", rate1 = data.rate1;
                // 微信初始化
                initWeixin(data.name, data.slogan, location.href, base.getShareImg(dpic));
                if (strs.length > 1) {
                    for (var i = 0; i < strs.length; i++) {
                        html += `<div class="swiper-slide"><img class="wp100" src="${base.getImg(strs[i], 1) + PIC_DETAIL}"></div>`;
                    }
                    $("#top-swiper").html(html);
                    initSwiper();
                } else {
                    $("#top-swiper").html(`<div class="swiper-slide"><img class="wp100" src="${base.getImg(dpic, 1) + PIC_DETAIL}"></div>`);
                }
                $("#name").text(data.name);
                $("#slogan").text(data.slogan);
                $("#advert").text(data.advert);
                $("#address").text(data.address);
                $("#bookMobile")
                    .append(`<a class="clearfix" href="tel://${data.bookMobile}">
                                <img class="wp16p mr4 va-m" src="/static/images/phone.png"/>
                                <span class="pr6 va-m inline_block">${data.bookMobile}</span>
                            </a>`);
                $("#description").html(data.description);
                rate1 && $("#discount").html(`通过我们，享${rate1 * 10}折`)
                rate2 = data.rate2;
            }, doError);
    }

    function initSwiper(){
        new Swiper('#swiper-container', {
            'direction': 'horizontal',
            'loop': true,
            'autoplayDisableOnInteraction': false,
            'pagination': '.swiper-pagination'
        });
    }
    // 微信初始化
    function initWeixin(title, desc, link, imgUrl){
        weixin.initShare({ title, desc, link, imgUrl });
    }

    function doError() {
        $("#description").html('<div class="bg_fff tc wp100">暂时无法获取商家信息</div>');
    }
});
