define([
    'app/controller/base',
    'app/module/loadImg',
    'app/module/scroll',
    'app/module/weixin',
    'app/interface/MallCtr'
], function(base, loadImg, scroll, weixin, MallCtr) {
    var cate = base.getUrlParam("c"),
        myScroll, lType,
        start = 1,
        limit = 10,
        isEnd = false,
        canScrolling = false;

    init();

    function init() {
        addListeners();
        base.showLoading();
        getBigCategoryList();
        weixin.initShare({
            title: document.title,
            desc: document.title,
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    // 获取商品大类
    function getBigCategoryList(){
        MallCtr.getBigCategoryList()
            .then(function(data) {
                var html = '', html1 = "";
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    html += `<li l_type="${d.code}">${d.name}</li>`;
                    html1 += `<li l_type="${d.code}" class="wp33 tl fl">${d.name}</li>`;
                }
                var scroller = $("#scroller");
                scroller.find("ul").html(html);
                $("#allItem").find("ul").html(html1);
                addCategory();
                cate = cate || data[0].code;
                scroller.find("ul>li[l_type='" + cate + "']").click();
            });
    }
    // 添加大类
    function addCategory() {
        var scroller = $("#scroller");
        var lis = scroller.find("ul li");
        for (var i = 0, width = 0; i < lis.length; i++) {
            width += $(lis[i]).width() + 29;
        }
        $("#scroller").css("width", width);
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'mallWrapper',
            param: {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
    }

    function addListeners() {
        /**大类start */
        $("#down").on("click", function() {
            var me = $(this);
            if (me.hasClass("down-arrow")) {
                $("#allCont").removeClass("hidden");
                me.removeClass("down-arrow").addClass("up-arrow");
            } else {
                $("#allCont").addClass("hidden");
                me.removeClass("up-arrow").addClass("down-arrow");
            }
        });
        $("#mall-mask").on("click", function() {
            $("#down").click();
        });
        $("#allItem").on("click", "li", function() {
            var lType = $(this).attr("l_type");
            $("#scroller").find("li[l_type='" + lType + "']").click();
            $("#down").click();
        });
        $("#scroller").on("click", "li", function() {
            var me = $(this);
            $("#mallWrapper").find(".current").removeClass("current");
            me.addClass("current");
            myScroll.myScroll.scrollToElement(this);
            lType = me.attr("l_type");
            start = 1;
            isEnd = false;
            base.showLoading();
            getProduces(lType);
            var allItem = $("#allItem");
            allItem.find("li.current").removeClass("current");
            allItem.find("li[l_type='" + lType + "']").addClass("current");
        });
        /**大类end */
    }
    //根据大类查询小类
    function getProduces(category) {
        $("#mlTable ul").empty();
        MallCtr.getSmallCategoryList(category).then(function(data) {
            base.hideLoading();
            $.each(data, function(i, val) {
                var name = val.name;
                var l_code = val.code;
                var html1 = "<li l_code=" + l_code + " class='wp20 tc s_10'>" + name + "</li>";
                html1 = $(html1);
                html1.on("click", function() {
                    start = 1;
                    isEnd = false;
                    base.showLoading();
                    $("#contUl").empty();
                    displayDetail(l_code, category).then(base.hideLoading);
                    $(this).addClass("active").siblings().removeClass("active");
                });
                //清空小类后再添加，否则会直接添加进去，原来的依旧在
                $("#mlTable ul").append(html1);
            });

            //默认选中第一个
            var smallEle = $("#mlTable ul li:eq(0)"),
                l_code = smallEle.attr("l_code");
            if (l_code) {
                smallEle.click();
            }else{
                base.showLoading();
                displayDetail("", category).then(base.hideLoading);
            }
            //下拉加载
            $(window).off("scroll").on("scroll", function() {
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                    canScrolling = false;
                    addLoading();
                    displayDetail(l_code, category);
                }
            });
        }, doError);
    }
    // 分页查询商品
    function displayDetail(l_code, category) {
        return MallCtr.getPageProduct({
            start,
            limit,
            "category": category,
            "type": l_code
        }).then(function(data) {
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= limit || lists.length < limit) {
                isEnd = true;
            }
            var html = "";
            if(lists.length){
                $.each(lists, function(i, val) {
                    html += buildHtml(val);
                });
                $("#contUl").append(loadImg.loadImg(html));
                start++;
                canScrolling = true;
            }else{
                doError();
            }
        }).always(removeLoading)
    }
    // 生成html
    function buildHtml(val) {
        var originalPrice = base.formatMoneyD(val.originalPrice) + "元",
            price1 = base.formatMoneyD(val.price1) + "元",
            price2 = base.formatMoneyD(val.price2) + "橙券";
        return `<li class="ptb8 clearfix b_bd_b plr10">
                    <a class="show p_r min-h100p" href="../operator/buy.html?code=${val.code}">
                        <div class="order-img-wrap tc"><img class="center-img1" src="${base.getImg(val.advPic, 1)}"></div>
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
                                    ? `<p class="s_10">${val.strain} | ${val.logisticsDate}</p>`
                                    : `<p class="s_10" style="text-decoration: line-through;">市场参考价：<span>${originalPrice}</span></p>`
                            }
                        </div>
                    </a>
                </li>`;
    }
    function doError() {
        $("#contUl").html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂无商品</div>');
    }

    function addLoading() {
        $("#contUl").append('<p class="scroll-loadding"></p>');
    }

    function removeLoading() {
        $("#contUl").find(".scroll-loadding").remove();
    }
});
