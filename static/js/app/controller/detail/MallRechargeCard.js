define([
    'app/controller/base',
    'app/module/loadImg',
    'app/module/foot',
    'app/interface/MallCtr'
], function(base, loadImg, Foot, MallCtr) {
    var config = {
            "start": 1,
            "limit": 10
        },
        canScrolling = false,
        isEnd = false;

    init();

    function init() {
        Foot.addFoot(1);
        base.showLoading();
        getRechargeCards().then(base.hideLoading, base.hideLoading);
    }

    function getRechargeCards() {
        return MallCtr.getRechargeCards(config).then(function(data) {
            var html = "";
            data.list.forEach(function(v, i) {
                html += '<li class="ptb8 clearfix b_bd_b plr10">' + '<a class="show p_r min-h100p" href="./recharge_cardDetail.html?code=' + v.code + '"><div class="order-img-wrap tc">' + '<img class="center-img1 wp100" src="' + base.getImg(v.advPic, 1) + '"></div>' + '<div class="order-right-wrap clearfix pt15"><p class="t_323232 s_14 line-tow">' + v.name + '</p>' + '<p class="t_999 s_12 mt10 line-tow">' + v.slogan + '</p></div></a></li>'
            });
            $("#contUl").append(loadImg.loadImg(html));
            if (+ data.totalCount <= config.limit || data.list.length < config.limit) {
                isEnd = true;
            }
            canScrolling = true;
        }).always(removeLoading);
    }

    function addListeners() {
        //下拉加载
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                displayDetail(l_code, category)
            }
        });
    }

    function addLoading() {
        $("#contUl").append('<li class="scroll-loadding"></li>');
    }

    function removeLoading() {
        $("#contUl").find(".scroll-loadding").remove();
    }

});
