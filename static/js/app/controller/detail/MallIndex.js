define([
    'app/controller/base',
    'app/util/dict',
    'swiper',
    'app/module/loadImg',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/MallCtr'
], function(base, dict, Swiper, loadImg, Foot, weixin, MallCtr) {

    var isEnd = false,
        canScrolling = false;
    var config = {
        "start": 1,
        "limit": 15,
        "location": "1"
    };

    init();

    function init() {
        Foot.addFoot(1);
        base.showLoading("加载中...", 1);
        addListeners();
        $.when(
            getBigCategoryList(),
            getPageProduct()
        ).then(function() {
            base.hideLoading();
        });
        weixin.initShare({
            title: document.title,
            desc: document.title,
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }

    //获取大类的数据字典
    function getBigCategoryList(){
        return MallCtr.getBigCategoryList()
            .then(function(data) {
                // 遍历大类
                $.each(data, function(i, val) {
                    var code1 = val.code,
                        html1 = '<li><div><img src="' + base.getImg(val.pic) + '"></div><p>' + val.name + '</p></li>';
                    html1 = $(html1);
                    html1.on("click", function() {
                        location.href = "./mall_list.htm?c=" + code1;
                    })
                    $(".classOne").append(html1)
                });
            });
    }
    //获取产品信息
    function getPageProduct(refresh){
        config.start = refresh && 1 || config.start;
        return MallCtr.getPageProduct(config, refresh)
            .then(function(data){
                var html = "";
                $.each(data.list, function(i, val) {
                    html += buildHtml(val);
                });
                $("#contUl").append(loadImg.loadImg(html));
                if(config.limit > data.list.length || config.limit >= data.totalCount){
                    isEnd = true;
                }else{
                    config.start++;
                }
                canScrolling = true;
            }).always(removeLoading);
    }
    function buildHtml(val) {
        var originalPrice = base.formatMoneyD(val.productSpecsList[0].originalPrice) + "元",
            price1 = base.formatMoneyD(val.productSpecsList[0].price1) + "元",
            price2 = base.formatMoneyD(val.productSpecsList[0].price2) + "橙券";

        return `<li class="ptb8 clearfix b_bd_b plr10">
                    <a class="show p_r min-h100p" href="../operator/buy.htm?code=${val.code}">
                        <div class="order-img-wrap tc default-bg"><img class="center-img1" src="${base.getImg(val.advPic, 1)}"/></div>
                        <div class="order-right-wrap am-flexbox am-flexbox-align-top am-flexbox-dir-column am-flexbox-justify-between">
                            <div class="am-flexbox am-flexbox-align-top wp100">
                                <p class="t_323232 s_12 line-tow am-flexbox-item ml0i">${val.name}</p>
                                ${val.saleStatus ? `<p class="item-rt-red">${val.saleStatus}</p>` : ""}
                            </div>
                            <p class="t_999 s_10 line-tow">${val.slogan}</p>
                            <p class="t_red ptb4">
                                <span class="s_12 t_red">${price2}</span>/<span class="s_12 t_red">${price1}</span>
                            </p>
                            ${
                                val.category == PSJH || val.category == GSRG
                                    ? `<p class="s_10">${val.strain} | ${val.logisticsDate} | ${
                                        val.category == PSJH
                                            ? `共${val.logisticsSum}次`
                                            : `${val.logisticsSum}年`
                                    }</p>`
                                    : `<p class="s_10" style="text-decoration: line-through;">市场参考价：<span>${originalPrice}</span></p>`
                            }
                        </div>
                    </a>
                </li>`;
    }
    function addListeners() {
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageProduct();
            }
        });
    }
    //添加下拉加载时的loading图标
    function addLoading() {
        $("#contUl").append('<li class="scroll-loadding"></li>');
    }
    //移除下拉加载时的loading图标
    function removeLoading() {
        $("#contUl").find(".scroll-loadding").remove();
    }

});
