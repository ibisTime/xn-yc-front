define([
    'app/controller/base',
    'app/module/loadImg',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/O2OCtr',
    'app/interface/GeneralCtr'
], function(base, loadImg, Foot, weixin, O2OCtr, GeneralCtr) {
    var config = {
        "limit": 10,
        "start": 1
    }, isEnd = false, canScrolling = false;

	init();

    function init() {
        Foot.addFoot(0);
    	businessPage();
    	getNavList();
        addListeners();
        weixin.initShare({
            title: document.title,
            desc: document.title,
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }

    //导航
    function getNavList() {
        base.showLoading("加载中...", 1);
        GeneralCtr.getNavList()
            .then(function(data) {
                base.hideLoading();
            	if(data.length){
	                for (var i = 0, html = ""; i < data.length; i++) {
	                    html += `<li><a href="javascript:void(0)" l_type="${data[i].code}">
                                    <div><img src="${base.getImg(data[i].pic)}" /></div>
                                    <p>${data[i].name}</p>
                                </a></li>`;
	                }
	                $("#con-table").html(html);
	            }
            });
    }

    function addListeners() {
        //页面下拉加载
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                businessPage();
            }
        });
        //搜索商家
        var str = "";

		$("#searchInput").keyup(function(e) {
   			e.stopPropagation();
            hasInput();
        });

        $("#searchInput").click(function(e) {
   			e.stopPropagation();
            hasInput();
        });

        $(document).click(function(e){
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
        //用户选择类型时（美食、电影等）
        $("#con-table").on("click", "a", function() {
            var type = $(this).attr("l_type"),
                li = $("#consumeUl").find("li.on"),
                url = "";
            url = "./list.html?t=" + type;
            location.href = url;
        });
    }

    //搜索商家   智能查询
    function searchBusiness(value) {
        O2OCtr.getPageBusiness({
            name: value,
            limit: 10,
            start: 1
        }).then(function(data) {
            var html = "";
            if (data.list.length) {
                data.list.forEach(function(item) {
                    html += '<li><a class="show" href="./detail.html?c=' + item.code + '">' + item.name + '</a></li>';
                });
            } else {
                html = '<li class="tc">未搜索到商家</li>';
            }
            $("#searchUl").html(html);
        });
    }

    // 获取商家
    function businessPage() {
        O2OCtr.getPageBusiness(config)
            .then(function(data) {
            	if(data.list.length){
                    var data = data,
                        totalCount = +data.totalCount,
                        curList = data.list;
                    if (totalCount <= config.limit || curList.length < config.limit) {
                        isEnd = true;
                    }
                    var html = "";
                    for (var i = 0; i < curList.length; i++) {
                        html += buildHtml(curList[i]);
                    }
                    $("#consume-ul").append(loadImg.loadImg(html));
                    config.start += 1;
                    canScrolling = true;
                }else{
                    judgeError();
                }
            }).always(removeLoading);
    }
    function buildHtml(data) {
        return `<li class="ptb8 clearfix b_bd_b plr10" code="${data.code}">
                    <a class="show p_r min-h100p" href="./detail.html?c=${data.code}">
                        <div class="consume-center-wrap default-bg">
                            <img class="center-img1 center-lazy" src="${base.getImg(data.advPic, 1)}"/>
                        </div>
                        <div class="consume-right-wrap">
                            <div>
                                <div class="am-flexbox am-flexbox-justify-between">
                                    <p class="tl t_norwrap t_bold am-flexbox-item ml0i">${data.name}</p>
                                    ${
                                        data.rate1 && data.rate1 != 1
                                            ? `<div class="t_ff0000 pl10 s_13">${data.rate1 * 10}折</div>`
                                            : ""
                                    }
                                </div>
                                <p class="tl pt4 line-tow s_10 t_80">${data.slogan}</p>
                                ${
                                    data.province == data.city
                                        ? `<p class="tl t_norwrap s_10 t_80 pa_btm">${data.province} ${data.area} ${data.address}</p>`
                                        : `<p class="tl t_norwrap s_10 t_80 pa_btm">${data.province} ${data.city} ${data.address}</p>`
                                }
                            </div>
                        </div>
                    </a>
                </li>`;
    }
    function judgeError() {
        if (config.start == 1) {
            doError();
        }
    }

    function addLoading() {
        $("#consume-ul").append('<li class="scroll-loadding"></li>');
    }

    function removeLoading() {
        $("#consume-ul").find(".scroll-loadding").remove();
    }

    function doError() {
        $("#consume-ul").html('<li style="text-align: center;line-height: 93px;">暂时无法获取商家信息</li>');
    }

});
