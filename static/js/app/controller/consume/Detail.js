define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/foot/foot',
    'lib/swiper-3.3.1.jquery.min'
], function(base, Ajax, Foot, Swiper) {
    var url = "808218",
        code = base.getUrlParam("c") || "",
        config = {
            code: code,
            userId: base.getUserId()
        },
        rate2;
        
	Foot.addFoot(0);
    initView();

    function initView() {
        if (code) {
            business();
            addListeners();
        } else {
            $("#cont").remove();
            base.showMsg("未传入商家编号!");
        }
    }

    function addListeners() {
        //点赞
        $("#dzIcon").on("click", function() {
        	if(!base.isLogin()){
                base.goLogin();
                return;
            }
            var $img = $("#goodImg");
            $img.attr("src");
            if ($img.attr("src").indexOf("/good.png") != -1) {
                praise();
            } else {
                praise(true);
            }
        });
        //积分消费
        $("#sbtn").on("click", function() {
            $("#choseDialog").removeClass("hidden");
        });
        $("#choseDialog").click(function() {
            $("#choseDialog").addClass("hidden");
        });
        $("#caigoPay").click(function(e) {
            e.stopPropagation();
            location.href = "./integral_consume.html?c=" + code + "&n=" + $("#name").text();
        });
        $("#rmbPay").click(function(e){
            e.stopPropagation();
            location.href = "../pay/rmb_consume.html?c=" + code + "&rate=" + rate1 + "&n=" + $("#name").text();
        })
    }
    //点赞
    function praise(flag) {
        var span = $("#totalDzNum"),
            img = $("#goodImg");
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post('808240', {
            json: {
                storeCode: code,
                type: 1,
                userId: base.getUserId()
            }
        }).then(function(response) {
            $("#loaddingIcon").addClass("hidden");
            if (response.success) {
                if (!flag) {
                    span.text(+ span.text() + 1);
                    img.attr("src", "/static/images/good1.png");
                } else {
                    span.text(+ span.text() - 1);
                    img.attr("src", "/static/images/good.png");
                }
            } else if (response.timeout) {
                location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
            } else {
                base.showMsg(response.msg);
            }
        });
    }
    //根据code搜索商家信息
    function business() {
        Ajax.get(url, config).then(function(response) {
            $("#cont").remove();
            if (response.success) {
                var data = response.data;
                var dpic = data.pic;
                if (data.isDZ) {
                    $("#goodImg").attr("src", "/static/images/good1.png");
                }
                
                
                var strs= []; //定义一数组 
				var html="";
				strs=dpic.split("||"); //字符分割
				
				if(strs.length>1){
					for (i=0;i<strs.length ;i++ ) { 
						html+='<div class="swiper-slide"><img class="wp100" src="' + base.getImg(strs[i], 1)+ PIC_DETAIL + '"></div>';
					}
					
					$("#top-swiper").html(html);
					
					var mySwiper = new Swiper('#swiper-container', {
	                    'direction': 'horizontal',
	                    'loop': true,
			            'autoplayDisableOnInteraction': false,
	                    // 如果需要分页器
	                    'pagination': '.swiper-pagination'
	                });
                
				}else{
					$("#top-swiper").html('<div class="swiper-slide"><img class="wp100" src="' + base.getImg(dpic, 1) + '"></div>');
				}
				
                $("#name").text(data.name);
                $("#slogan").text(data.slogan);
                $("#totalDzNum").text(data.totalDzNum);
                $("#advert").text(data.advert);
                $("#address").text(data.address);
                $("#bookMobile").append('<a class="clearfix" href="tel://' + data.bookMobile + '"><img class="wp16p mr4 va-m" src="/static/images/phone.png"/><span class="pr6 va-m inline_block">' + data.bookMobile + '</span></a>');
                $("#description").html(data.description);

//              rate2 = data.rate2;
                rate1 = data.rate2;
            } else {
                doError();
            }
        });
    }

    function doError() {
        $("#description").html('<div class="bg_fff tc wp100">暂时无法获取商家信息</div>');
    }
});
