define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/module/loadImg/loadImg',
    'app/module/loading/loading',
    'app/module/foot/foot',
], function(base, Ajax, dialog, loadImg, loading, Foot) {
    var url = "808217",

    config = {
//      "province": "浙江省",
//      "city": "宁波市",
//      "area": "余姚区",
        "limit": 10,
        "start": 1,
        "orderDir": "desc",
        "orderColumn": "total_dz_num",
        "status": "2",
        "userId": base.getUserId()
    },
    isEnd = false,
    canScrolling = false;

	Foot.addFoot(0);
	initView();
	
    function initView() {
    	businessPage();
    	getNavList();
        addListeners();
    }
    
    var count = 1;

    //导航
    function getNavList() {
        $("#con-table").html('<i class="icon-loading3"></i>');
        var param = {
            "parentCode": "0",
            "status": "1",
            "orderColumn": "order_no",
            "orderDir": "asc",
            type: "2"
        };
        Ajax.get("808007", param)
            .then(function(res) {
                if (res.success) {
                	if(res.data.length){
                		
		                for (var i = 0, html = ""; i < res.data.length; i++) {
		                    html += '<li><a href="javascript:void(0)" l_type="' + res.data[i].code + '"><div>'+
		                        '<img src="'+base.getImg(res.data[i].pic)+'" alt=""></div><p>' + res.data[i].name + '</p></a></li>';
		                }
		                // html += '</tr>';
		                var center = $(html),
		                    imgs = center.find('img'),
		                    length = imgs.length;
		                count = length;
		                for (var i = 0; i < length; i++) {
		                    var img = imgs.eq(i);
		                    if (img[0].complete) {
		                        isReady();
		                        continue;
		                    }
		                    (function(img) {
		                        img[0].onload = (function() {
		                            isReady();
		                        });
		                    })(img);
		                }
		                $("#con-table").empty().append(center);
		            }else {
	                    $("#con-table").html('<tr style="line-height: 140px;"><td>暂无分类信息</td></tr>');
	                }
                } else {
                    base.showMsg(res.msg)
                }
            }, function() {
                $("#con-table").html('<tr style="line-height: 140px;"><td>暂无分类信息</td></tr>');
            });
    }

    function isReady() {
        if (!--count) {
            var height = $("#conTop")[0].offsetHeight + $("#tableWrap")[0].offsetHeight;
            $("#marginTop").css("height", height);
        }
    }

    function addListeners() {
        //点赞
        $("#consume-ul").on("click", ".good-div", function(e) {
            var me = $(this),
                $img = me.find("img");
//          e.preventDefault();
//          e.stopPropagation();
            if(!base.isLogin()){
                base.goLogin();
                return;
            }
            if ($img.attr("src").indexOf("/good.png") != -1) {
                praise(this, $img);
            } else {
                praise(this, $img, true);
            }
        });
        //页面下拉加载
        $(window).on("scroll", function() {
            var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())
                //列表下拉框未显示时才加载
                &&
                $("#mask").hasClass("hidden")) {
                canScrolling = false;
                addLoading();
                businessPage();
            }
        });
        //搜索商家
        var str = "";
		
		$("#searchInput").keyup(function(e) {
			e=e||window.event;  
   			e.stopPropagation();  
            hasInput();
            hideMaskAndUl();
        });
        
        $("#searchInput").click(function(e) {
			e=e||window.event;  
   			e.stopPropagation(); 
            hasInput();
            hideMaskAndUl();
        });
        
        $(document).click(function(e){
			// 失去焦点时要做的事情
			$("#searchUl").addClass("hidden");
		});
        
        $("#searchIcon").click(function(e) {
			e=e||window.event;  
   			e.stopPropagation();  
            hasInput();
            hideMaskAndUl();
        });
        
        function hasInput() {
        	var sVal = $("#searchInput").val();
        	$("#searchUl").removeClass("hidden");
	        
	        if (!sVal || sVal.trim() === "") {
	            $("#searchUl").addClass("hidden").empty();
	            str = "";
	        } else if (sVal != str) {
	            searchBusiness($('#searchInput')[0]);
	            str = sVal;
	        }
	    }
        
        //点击覆盖层时，隐藏下拉列表
        $("#mask").on("click", function() {
            hideMaskAndUl();
        });
        //用户选择类型时（美食、电影等）
        $("#con-table").on("click", "a", function() {
            var type = $(this).attr("l_type"),
                li = $("#consumeUl").find("li.on"),
                url = "";
            url = "./list.html?t=" + type;
            location.href = url;
        });
    }

    //重新选择区域或类型后重新加载
    function doCityChose() {
        canScrolling = false;
        isEnd = false;
        first = true;
        $("#consume-ul").empty();
        addLoading();
        businessPage();
        hideMaskAndUl();
    }
    //隐藏列表
    function hideMaskAndUl() {
        $("#mask, #consumeDiv").addClass("hidden");
    }

    //搜索商家   智能查询
    function searchBusiness(me) {
        var sConfig = {
//          province: config.province,
//          city: config.city,
//          area: config.area,
            name: me.value,
            limit: 10,
            start: 1,
            orderDir: "desc",
            orderColumn: "total_dz_num"
        };
        Ajax.get(url, sConfig)
            .then(function(response) {
                if (response.success) {
                    var html = "",
                        curList = response.data.list;
                    if (curList.length) {
                        curList.forEach(function(item) {
                            html += '<li><a class="show" href="./detail.html?c=' + item.code + '">' + item.name + '</a></li>';
                        });
                        $("#searchUl").removeClass("hidden").html(html);
                    } else {
                        $("#searchUl").empty().addClass("hidden");
                    }
                }
            });
    }


    //点赞
    function praise(me, img, flag) {
        var $me = $(me),
            code = $me.closest("li[code]").attr("code"),
            span = $me.find("span");
            
        $("#loaddingIcon1").removeClass("hidden");
        Ajax.post('808240', {json: { storeCode: code, type: 1, userId: base.getUserId() }})
            .then(function(response) {
                $("#loaddingIcon1").addClass("hidden");
                if (response.success) {
                    if (!flag) {
                        span.text(+span.text() + 1);
                        img.attr("src", "/static/images/good1.png");
                    } else {
                        span.text(+span.text() - 1);
                        img.attr("src", "/static/images/good.png");
                    }
                } else if (response.timeout) {
                    location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
                } else {
                    base.showMsg(response.msg);
                }
            });
    }


    // 获取商家
    function businessPage() {
    	config.isDefault = "";
        Ajax.get(url, config)
            .then(function(response) {
                if (response.success) {
                	if(response.data.list.length){
                	
                        var data = response.data,
                            totalCount = +data.totalCount,
                            curList = data.list;
                        if (totalCount <= config.limit || curList.length < config.limit) {
                            isEnd = true;
                        }
                        if (curList.length) {
                            var html = "";
                            for (var i = 0; i < curList.length; i++) {
                                html += '<li class="ptb8 clearfix b_bd_b plr10" code="' + curList[i].code + '">' +
                                    '<a class="show p_r min-h100p" href="./detail.html?c=' + curList[i].code + '">' +
                                    '<div class="consume-center-wrap default-bg"><img class="center-img1 center-lazy" src="' + base.getImg(curList[i].advPic, 1) + '"/></div>' +
                                    '<div class="consume-right-wrap">' +
                                    '<p class="tl line-tow t_bold">' + curList[i].name + '</p>' +
                                    '<p class="tl pt4 line-tow s_10 t_80">' + curList[i].slogan + '</p>' ;
                                
                                if(curList[i].province==curList[i].city){
                                	html +=  '<p class="tl pt4 line-tow s_10 t_80">'
//                              	+ curList[i].province + " " + curList[i].area + " "
									+ curList[i].address + '</p></div>';
                                }else{
                                	html +=  '<p class="tl pt4 line-tow s_10 t_80">' 
//                              	+ curList[i].province + " "+ curList[i].city + " " 
                                	+ curList[i].address + '</p></div>';
                                }

                                if (!curList[i].isDZ) {
                                    html += '</a><div class="good-div"><img src="/static/images/good.png"/><span class="inline_block va-m pl6 t_80">' + curList[i].totalDzNum + '</span>';
                                } else {
                                    html += '</a><div class="good-div"><img src="/static/images/good1.png"/><span class="inline_block va-m pl6 t_80">' + curList[i].totalDzNum + '</span>';
                                }
                                html += '</div></li>';
                            }
                            $("#consume-ul").append(loadImg.loadImg(html));
                            removeLoading();
                            config.start += 1;
                        } else {
                            judgeError();
                        }
                    }else{
	                    $("#consume-ul").html('<li style="text-align: center;line-height: 93px;">暂时无商家信息</li>');
                    }
                } else {
                    base.showMsg(res.msg)
                }
                canScrolling = true;
            });
    }
    
    function judgeError() {
        if (first) {
            doError();
        } else {
            removeLoading();
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
