define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/util/dialog',
    'Handlebars',
    'app/module/loadImg/loadImg'
], function(base, Ajax, Dict, dialog, Handlebars, loadImg) {
    var code = base.getUrlParam("code") || "",
        q = base.getUrlParam("q") || "1",
        receiptType = Dict.get("receiptType"),
        userId = sessionStorage.getItem("userId"),
        token = sessionStorage.getItem("token"),
        addrInfo = {},
        toUser = "";
    init();

    function init() {
        $.when(
        	getAddress(),
	        getModel(),
	        getSeller()
        );
        
        addListeners();
    }
	
	//获取货品商
	function getSeller() {
        var html = "";
        Ajax.get('805055', {
            kind: "05",
            status: "0"
        }).then(function(res) {
            if (res.success) {
                var data = res.data,
                    html = "";
                html += '<option value="' + SYSTEM_USERID + '">姚橙平台</option>';
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    html += '<option value="' + d.userId + '">' + d.loginName + '</option>';
                }
                $("#seller").html(html);
            }
        });
    }
	
	//获取地址信息
    function getAddress() {
        var url ="805165",
	        param = {
	            "userId":userId,
	            "token":token,
	            "isDefault": ""
	        },
	        addressTmpl = __inline("../../ui/submit-order-address.handlebars");
        
   		Ajax.post(url, {json:param})
        .then(function(response) {
            $("#cont").hide();
            if (response.success) {
                var data = response.data,
                    html1 = "",
                    len = data.length;;
                if (len) {
                    for (var i = 0; i < len; i++) {
                        if (data[i].isDefault == "1") {
                            break;
                        }
                    }
                    if (i == len) {
                        i = 0;
                    }
                    addrInfo = data[i];
                    var content = addressTmpl(data[i]);
                    $("#addressDiv").append(content);
                    $("#addressRight").removeClass("hidden");
                } else {
                    $("#noAddressDiv").removeClass("hidden");
                }
            } else {
                doError("#addressDiv");
            }
        });
    }
    
    
    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
    }
    
    //单种商品点击购买后查询相关信息
    function getModel() {
        var url = "808026",
            config = {
                "code": code
            };
        Ajax.post(url, {json:config})
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        html = '';
                        
                    //商品总计
                    var totalCBAmount = +data.price2 * +q;
                    var totalCMBAmount = +data.price1 * +q;
                    $("#totalCBAmount").html(base.formatMoney(totalCBAmount)+"橙券/"+base.formatMoney(totalCMBAmount)+"元");

                    html += '<ul class="">' +
                        '<li class="ptb8 clearfix  plr10" modelCode="' + data.code + '">' +
                        '<a href="../operator/buy.html?code=' + data.code + '" class="show p_r min-h100p">' +
                        '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + base.getImg(data.advPic) + '"/></div>' +
                        '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                        '<p class="tl line-tow">' + data.name + '</p>' +
                        '<p class="tl pt4 line-tow">' + data.slogan + '</p>' +
                        '</div>' +
                        '<div class="fl wp40 tr s_10">';
                    
                    html += '<p><span class="item_totalP">' + base.formatMoney(data.price2) + '橙券</span><br/>或<span class="item_totalP">' + base.formatMoney(data.price1) + '元</span></p>';
                    
                    html += '<p class="t_80">×<span>' + q + '</span></p></div></div></a></li></ul>';

                    $("#items-cont").append(loadImg.loadImg(html));
                    $("#cont").hide();
                } else {
                    doError("#items-cont");
                }
            });
    }

    function addListeners() {
        //地址栏按钮
        $("#addressDiv").on("click", "a", function() {
            //如果没有地址，调到添加地址页
            if (this.id == "add-addr") {
            	sessionStorage.setItem("returnhref",  location.href);
                location.href = "./add_address.html?return=1";
             
             //调到地址列表页
            } else {
            	sessionStorage.setItem("returnhref",  location.href);
                location.href = "./address_list.html?c=" + $(this).attr("code") + "&return=1";
            }
        });
        //提交订单按钮
        $("#sbtn").on("click", function() {
            var $a = $("#addressDiv>a");
            //如果不是选择自提的方式，则判断是否选择地址
            if ($("#psfs").val() == "1") {
                if (!$a.length) {
                    showMsg("未选择地址");
                    return;
                }
            }
            //备注过长
            if ($("#apply_note").val().length > 255) {
                showMsg("备注字数必须少于255位");
                return;
            }
            //提交订单前准备相关参数
            PrepareConfig();
        });
        //配送方式
        $("#psfs").on("change", function() {
            var me = $(this);
            if (me.val() == "2") {
                $("#zt").addClass("hidden");
                $("#sj").removeClass("hidden");
                $("#addressDiv").addClass("hidden");
                $(".addressDivTitle").addClass("hidden");
            } else {
                $("#sj").addClass("hidden");
                $("#zt").removeClass("hidden");
                $("#addressDiv").removeClass("hidden");
                $(".addressDivTitle").removeClass("hidden");
            }
        });
    }
    //提交订单前准备相关参数
    function PrepareConfig() {
        var bizType = '808050',
            config;
        var tPrice = (+$("#items-cont").find(".item_totalP").text()) * 1000;
        config = {
            "productCode": code,
            "quantity": q
        };
        
        //提交订单
        doSubmitOrder(config, bizType);
    }

    function showMsg(cont) {
        var d = dialog({
            content: cont,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, 2000);
    }
    //提交订单
    function doSubmitOrder(config, bizType) {
        //如果是配送的
        if ($("#psfs").val() == "1") {
            config.toUser = SYSTEM_USERID;
	            config.pojo = {
	            receiver: addrInfo.addressee,
	            reMobile: addrInfo.mobile,
	            reAddress: addrInfo.province + addrInfo.city + addrInfo.district + addrInfo.detailAddress,
	            applyUser: sessionStorage.getItem("userId"),
	            applyNote: $("#apply_note").val() || "",
	            companyCode: SYSTEM_CODE,
	            systemCode: SYSTEM_CODE
	        };
            
            //自提的方式
        } else {
            config.toUser = $("#seller").val();
            config.addressCode = "";
            if (!config.toUser) {
                showMsg("商家不能为空");
                return;
            }
            config.pojo = {
	            receiver: "",
	            reMobile: "",
	            reAddress: "",
	            applyUser: sessionStorage.getItem("userId"),
	            applyNote: $("#apply_note").val() || "",
	            companyCode: SYSTEM_CODE,
	            systemCode: SYSTEM_CODE
	        };
        }
        
        //提交订单
        Ajax.post(bizType, {json: config})
            .then(function(response) {
                if (response.success) {
                    var code = response.data || response.data.code;
                    location.href = '../pay/pay_order.html?code=' + code;
                } else {
                    showMsg(response.msg);
                }
            });
    }
});
