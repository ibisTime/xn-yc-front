define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loadImg',
    'app/interface/MallCtr'
], function(base, Ajax, loadImg, MallCtr) {
    var sVal = base.getUrlParam("s") || "",
        isEnd = false,
        canScrolling = false,
        searchConfig = {
            limit: 15,
            start: 1
        };

    initView();

    function initView() {
        addListeners();
        if (sVal) {
            $("#searchInput").val(sVal);
            $("#searchIcon").click();
        }
    }

    function addListeners() {
        //搜索按钮
        $("#searchIcon").on("click", function() {
            sVal = $("#searchInput").val();
            isEnd = false;
            searchConfig.start = 1;
            canScrolling = false;
            $("#searchUl").empty();
            base.showLoading();
            doSearch().then(base.hideLoading);
        });
        //页面下拉加载数据
        $(window).on("scroll", function() {
            var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                doSearch();
            }
        });
    }

    function doSearch() {
        searchConfig.name = sVal;
        return MallCtr.getPageProduct(searchConfig)
            .then(function(data) {
                var list = data.list;
                if (+data.totalCount <= searchConfig.limit || list.length < searchConfig.limit) {
                    isEnd = true;
                }
                if (list.length) {
                    var html = "";
                    list.forEach(function(d) {
                        html += buildHtml(d);
                    });
                    $("#searchUl").append(loadImg.loadImg(html));
                    searchConfig.start += 1;
                    canScrolling = true;
                } else {
                    if (searchConfig.start == 1) {
                        doError("没有相关商品");
                    }
                }
            }, function(error){
                if (searchConfig.start == 1) {
                    doError();
                }
            });
    }

    function buildHtml(d) {
        var originalPrice = base.formatMoneyD(d.productSpecsList[0].originalPrice) + "元",
            price1 = base.formatMoneyD(d.productSpecsList[0].price1) + "元",
            price2 = base.formatMoneyD(d.productSpecsList[0].price2) + "橙券";
        return `<li class="ptb8 clearfix b_bd_b">
                    <a class="show p_r min-h100p" href="../operator/buy.htm?code=${d.code}">
                        <div class="order-img-wrap tc default-bg"><img class="center-img1 center-lazy" src="${base.getImg(d.advPic)}"/></div>
                        <div class="order-right-wrap am-flexbox am-flexbox-align-top am-flexbox-dir-column am-flexbox-justify-between">
                            <div class="am-flexbox am-flexbox-align-top wp100">
                                <p class="t_323232 s_12 line-tow am-flexbox-item ml0i">${d.name}</p>
                                ${d.saleStatus ? `<p class="item-rt-red">${d.saleStatus}</p>` : ""}
                            </div>
                            <p class="t_999 s_10 line-tow">${d.slogan}</p>
                            <p class="t_red ptb4">
                                <span class="s_12 t_red">${price2}</span>/<span class="s_12 t_red">${price1}</span>
                            </p>
                            ${
                                d.category == PSJH || d.category == GSRG
                                    ? `<p class="s_10">${d.strain} | ${d.logisticsDate} | ${
                                        d.category == PSJH
                                            ? `共${d.logisticsSum}次`
                                            : `${d.logisticsSum}年`
                                    }</p>`
                                    : `<p class="s_10"  style="text-decoration: line-through;">市场参考价：<span>${originalPrice}</span></p>`
                            }
                        </div>
                    </a>
                </li>`;
    }

    function addLoading() {
        $("#searchUl").append('<li class="scroll-loadding"></li>');
    }

    function doError(msg) {
        msg = msg || "暂时无法获取商品信息";
        $("#searchUl").html('<li class="bg_fff" style="text-align: center;line-height: 110px;">' + msg + '</li>');
    }

    function removeLoading() {
        $("#searchUl").find(".scroll-loadding").remove();
    }
});
