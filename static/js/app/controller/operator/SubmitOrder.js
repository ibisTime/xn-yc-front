define([
    'app/controller/base',
    'app/util/dict',
    'Handlebars',
    'app/module/loadImg',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/MallCtr'
], function(base, Dict, Handlebars, loadImg, GeneralCtr, UserCtr, MallCtr) {
    var code = base.getUrlParam("code"),
        q = base.getUrlParam("q") || "1",
        productSpecsCode = base.getUrlParam("spec"),
        userId = base.getUserId(),
        addrInfo = {},
        toUser = "";
    init();

    function init() {
        base.showLoading();
        $.when(
        	getAddress(),
	        getProduct(),
	        getSeller()
        ).then(base.hideLoading);
        addListeners();
    }

	//获取货品商
	function getSeller() {
        GeneralCtr.getSeller()
            .then(function(data) {
                var html = '<option value="' + SYSTEM_USERID + '">姚橙平台</option>';
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    html += '<option value="' + d.userId + '">' + d.loginName + '</option>';
                }
                $("#seller").html(html);
            });
    }

	//获取地址信息
    function getAddress() {
        var addressTmpl = __inline("../../ui/submit-order-address.handlebars");
        return UserCtr.getAddressList()
            .then(function(data) {
                var len = data.length;;
                if (len) {
                    for (var i = 0; i < len; i++) {
                        if (data[i].isDefault == "1") {
                            break;
                        }
                    }
                    i = i == len ? 0 : i;
                    addrInfo = data[i];
                    $("#addressDiv").append(addressTmpl(data[i]));
                    $("#addressRight").removeClass("hidden");
                } else {
                    $("#noAddressDiv").removeClass("hidden");
                }
            }, function(){
                doError("#addressDiv");
            });
    }


    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
    }

    //查询商品详情
    function getProduct() {
        return MallCtr.getProduct(code)
            .then(function(data) {
                var productSpec;
                for(var i = 0; i < data.productSpecsList.length; i++){
                    if(data.productSpecsList[i].code == productSpecsCode){
                        productSpec = data.productSpecsList[i]
                    }
                }
                if(!productSpec){
                    productSpec = data.productSpecsList[0];
                    productSpecsCode = productSpec.code;
                }
                //商品总计
                var totalCBAmount = +productSpec.price2 * +q,
                    totalCMBAmount = +productSpec.price1 * +q;
                $("#totalCBAmount").html(base.formatMoney(totalCBAmount) + "橙券/" + base.formatMoney(totalCMBAmount) + "元");
                var html = buildHtml(data, productSpec);
                $("#items-cont").append(loadImg.loadImg(html));
            }, function(){
                doError("#items-cont");
            });
    }

    function buildHtml(data, productSpec){
        return `<ul>
                    <li class="ptb8 clearfix  plr10" modelCode="${data.code}">
                        <a href="../operator/buy.htm?code=${data.code}" class="show p_r min-h100p">
                            <div class="order-img-wrap tc default-bg">
                                <img class="center-img1" src="${base.getImg(data.advPic)}"/>
                            </div>
                            <div class="order-right-wrap clearfix">
                                <div class="fl wp60">
                                    <p class="tl line-tow">${productSpec.name}</p>
                                    <p class="tl pt4 line-tow">${data.slogan}</p>
                                </div>
                                <div class="fl wp40 tr s_10">
                                    <p>
                                        <span class="item_totalP">${base.formatMoney(productSpec.price2)}橙券</span><br/>或
                                        <span class="item_totalP">${base.formatMoney(productSpec.price1)}元</span>
                                    </p>
                                    <p class="t_80">×<span>${q}</span></p>
                                </div>
                            </div>
                        </a>
                    </li>
                </ul>`;
    }

    function addListeners() {
        //地址栏按钮
        $("#addressDiv").on("click", "a", function() {
            //如果没有地址，调到添加地址页
            if (this.id == "add-addr") {
            	sessionStorage.setItem("returnhref",  location.href);
                location.href = "./add_address.htm?return=1";
             //调到地址列表页
            } else {
            	sessionStorage.setItem("returnhref",  location.href);
                location.href = "./address_list.htm?c=" + $(this).attr("code") + "&return=1";
            }
        });
        //提交订单按钮
        $("#sbtn").on("click", function() {
            var $a = $("#addressDiv>a");
            //如果不是选择自提的方式，则判断是否选择地址
            if ($("#psfs").val() == "1") {
                if (!$a.length) {
                    base.showMsg("未选择地址");
                    return;
                }
            }
            //备注过长
            if ($("#apply_note").val().length > 255) {
                base.showMsg("备注字数必须少于255位");
                return;
            }
            base.showLoading("提交中...");
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
        var tPrice = (+$("#items-cont").find(".item_totalP").text()) * 1000;
        doSubmitOrder({
            productSpecsCode,
            "quantity": q
        });
    }

    //提交订单
    function doSubmitOrder(config) {
        //如果是配送的
        if ($("#psfs").val() == "1") {
            config.toUser = SYSTEM_USERID;
            config.pojo = {
	            receiver: addrInfo.addressee,
	            reMobile: addrInfo.mobile,
	            reAddress: addrInfo.province + addrInfo.city + addrInfo.district + addrInfo.detailAddress,
	            applyUser: base.getUserId(),
	            applyNote: $("#apply_note").val() || "",
	            companyCode: SYSTEM_CODE,
	            systemCode: SYSTEM_CODE
	        };

            //自提的方式
        } else {
            config.toUser = $("#seller").val();
            config.addressCode = "";
            if (!config.toUser) {
                base.showMsg("商家不能为空");
                return;
            }
            config.pojo = {
	            receiver: "",
	            reMobile: "",
	            reAddress: "",
	            applyUser: base.getUserId(),
	            applyNote: $("#apply_note").val() || "",
	            companyCode: SYSTEM_CODE,
	            systemCode: SYSTEM_CODE
	        };
        }

        //提交订单
        MallCtr.submitOrder(config)
            .then(function(data) {
                base.hideLoading();
                var code = data.code || data;
                location.replace('../pay/pay_order.htm?code=' + code);
            });
    }
});
