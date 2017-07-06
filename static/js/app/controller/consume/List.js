define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'app/interface/O2OCtr'
], function(base, Foot, weixin, GeneralCtr, O2OCtr) {
    var type = base.getUrlParam("t"),
        conTypes = {},
        config = {
            type: type,
            limit: 15,
            start: 1
        },
        isEnd = false,
        canScrolling = false;

    init();

    function init() {
        Foot.addFoot(0);
        base.showLoading("加载中...", 1);
        getNavList();
        businessPage().then(base.hideLoading);
        addListeners();
        weixin.initShare({
            title: document.title,
            desc: document.title,
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    //添加类型列表
    function getNavList() {
        GeneralCtr.getNavList().then(function(data) {
            if (data.length) {
                for (var i = 0, html = ""; i < data.length; i++) {
                    conTypes[data[i].code] = data[i].name;
                    html += '<li l-type="' + data[i].code + '">' + data[i].name + '</li>';
                }
                $("#consumeUl").html(html).find("li[l-type='" + type + "']").addClass("on");
                $("#lTypes").find("span").text(conTypes[type]);
            }
        });
    }

    function addListeners() {
        //下拉加载
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop()) && $("#mask").hasClass("hidden")) {
                canScrolling = false;
                addLoading();
                businessPage();
            }
        });
        //搜索
        var str = "";

        $("#searchInput").keyup(function(e) {
            e.stopPropagation();
            hasInput();
            hideMaskAndUl();
        });

        $("#searchInput").click(function(e) {
            e = e || window.event;
            e.stopPropagation();
            hasInput();
            hideMaskAndUl();
        });

        $(document).click(function(e) {
            // 失去焦点时要做的事情
            $("#searchUl").addClass("hidden");
        });

        function hasInput() {
            var sVal = $("#searchInput").val();
            if (!sVal || sVal.trim() === "") {
                $("#searchUl").addClass("hidden").empty();
                str = "";
            } else if (sVal != str) {
                $("#searchUl").html('<li class="scroll-loadding"></li>').removeClass("hidden");
                clearTimeout(hasInput.timer);
                hasInput.timer = setTimeout(() => {
                    searchBusiness(sVal);
                }, 150);
                str = sVal;
            }
        }
        //类型选择按钮
        $("#lTypes").on("click", function() {
            var mask = $("#mask"),
                cList = $("#cListDiv");
            if (cList.hasClass("hidden")) {
                if (mask.hasClass("hidden")) {
                    mask.removeClass("hidden");
                } else {
                    $("#cAreaDiv").addClass("hidden");
                }
                cList.removeClass("hidden");
            } else {
                mask.addClass("hidden");
                cList.addClass("hidden");
            }
        });
        //类型选择列表（酒店、周边游等）
        $("#consumeUl").on("click", "li", function() {
            config.type = $(this).attr("l-type");
            $("#lTypes").find("span").text(conTypes[config.type]);
            $("#consumeUl").find("li.on").removeClass("on").siblings("li[l-type='" + config.type + "']").addClass("on");
            doAreaOrTypeChose();
        });
        //点击覆盖层时，隐藏下拉列表
        $("#mask").on("click", function() {
            hideMaskAndUl();
        })
    }
    //重新选择区域或类型后重新加载
    function doAreaOrTypeChose() {
        canScrolling = false;
        isEnd = false;
        config.start = 1;
        $("#consume-ul").empty();
        addLoading();
        businessPage();
        hideMaskAndUl();
    }
    //隐藏列表
    function hideMaskAndUl() {
        $("#mask, #cListDiv, #cAreaDiv").addClass("hidden");
    }
    //搜索商家
    function searchBusiness(value) {
        O2OCtr.getPageBusiness({
            type: config.type,
            name: value,
            limit: 10,
            start: 1
        }).then(function(data) {
            var html = "",
                curList = data.list;
            if (curList.length) {
                curList.forEach(function(item) {
                    html += `<li><a class="show" href="./detail.htm?c=${item.code}">${item.name}</a></li>`;
                });
            } else {
                html = '<li class="tc">未搜索到商家</li>';
            }
            $("#searchUl").html(html);
        });
    }
    //分页查询商家
    function businessPage() {
        return O2OCtr.getPageBusiness(config)
            .then(function(data) {
                var totalCount = +data.totalCount,
                    curList = data.list;
                if (totalCount <= config.limit || curList.length < config.limit) {
                    isEnd = true;
                }
                if (curList.length) {
                    var html = "";
                    for (var i = 0; i < curList.length; i++) {
                        html += buildHtml(curList[i]);
                    }
                    $("#consume-ul").append(html);
                    canScrolling = true;
                    config.start += 1;
                } else {
                    judgeError();
                }
            }, judgeError).always(removeLoading);
    }
    function buildHtml(data){
        return `<li class="ptb8 clearfix b_bd_b plr10" code="${data.code}">
                    <a class="show p_r min-h100p" href="./detail.htm?c=${data.code}">
                        <div class="consume-center-wrap default-bg">
                            <img class="center-img1 center-lazy hp100" src="${base.getImg(data.advPic, 1)}"/>
                        </div>
                        <div class="consume-right-wrap">
                            <div>
                                <div class="am-flexbox am-flexbox-justify-between">
                                    <p class="tl t_norwrap t_bold am-flexbox-item ml0i">${data.name}</p>
                                    ${
                                        data.rate1 && data.rate1 != 1
                                            ? `<div class="t_ff0000 pl10 s_10">${data.rate1 * 10}折</div>`
                                            : ""
                                    }
                                </div>
                                <p class="tl pt4 line-tow s_10 t_80">${data.slogan}</p>
                                ${
                                    data.province == data.city
                                        ? `<p class="tl pt4 t_norwrap s_10 t_80 pa_btm">${data.province} ${data.area} ${data.address}</p>`
                                        : `<p class="tl pt4 t_norwrap s_10 t_80 pa_btm">${data.province} ${data.city} ${data.address}</p>`
                                }
                            </div>
                        </div>
                    </a>
                    <div class="good-div t_ff0000"></div>
                </li>`;
    }
    //处理异常情况
    function judgeError() {
        if (config.start == 1) {
            doError();
        }
    }
    //添加下拉加载时的loading图标
    function addLoading() {
        $("#consume-ul").append('<li class="scroll-loadding"></li>');
    }
    //移除下拉加载时的loading图标
    function removeLoading() {
        $("#consume-ul").find(".scroll-loadding").remove();
    }

    function doError() {
        $("#consume-ul").html('<li style="text-align: center;line-height: 93px;">暂时无法获取商家信息</li>');
    }
});
