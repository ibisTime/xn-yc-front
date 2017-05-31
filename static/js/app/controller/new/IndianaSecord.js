define([ 'app/controller/base',
    'app/util/ajax',
    'app/util/dict'
], function(base, Ajax, dict) {
    var templateCode = base.getUrlParam("templateCode");
    var start=1,limit=10;
    var isEnd = false,
        canScrolling = false;
    init();
    function init() {
        getPageRecord();
        addListener();
    }

    function getPageRecord(){
        var param ={
            "companyCode": COMPANYCODE,
            "userId": base.getUserId(),
            "status": "1",
            "start":start,
            "limit": limit
        };
        Ajax.post("615027",{json:param})
            .then(function (res) {
                if(res.success){
                    if(res.data.list == 0 && start == 1){
                        base.showMsg("您暂时还没有夺宝记录");
                        $("#cont").hide();
                        return;
                    }
                    var lists = res.data.list;

                    var totalCount = +res.data.totalCount
                    if (totalCount <= limit || lists.length < limit) {
                        isEnd = true;
                    }
                    
                    
                    var html="";
                    for(var i = 0; i <lists.length ; i++){
                    	var val = lists[i];
                    	
                    		var s="";
                        	var surplus = val.totalNum - val.investNum;
                        	
                            if (val.toCurrency == "CNY") {
                                var toAmount = val.toAmount / 1000 + "元"
                            } else if (val.toCurrency == "CB") {
                                var toAmount = val.toAmount / 1000 + "橙券"
                            } else {
                                var toAmount = val.toAmount / 1000 + "积分"
                            }
                            
                            var maxVal = val.totalNum;
                            var Val = val.investNum
                            var percent = Val / maxVal * 1.55;
                            var code = val.code;
                            s += '<li data-code="'+code+'"><div class="wrap"><div class="indiana-num">第<span id="periods">' + val.periods + '</span>期</div>';
					        s += '<div class="indiana-has"><span id="toAmount">'+ toAmount + '</span><div class="wrapDiv"><div style="width:'+percent+'rem;"></div></div></div>';
					        s += '<div class="indiana-person"><p>总需人次</p><p class="num" id="totalNum">' + val.totalNum + '</p></div>';
					        s += '<div class="indiana-last"><p>剩余人次</p><p class="num">' + surplus + '</p></div>';
					        s += '<div class="indiana-price"><p>单价</p><p class="num" id="fromAmount">' + val.fromAmount / 1000 + '</p></div></div>';
					        s += '<div class="fs13 joinWrap hidden"></div></li>';
					        
                            html += s;

                            removeLoading();
                        
                    }
                    
                    $(".indianaDetail").append(html);
                    
                    $("#cont").hide();
                    start++
                }else{
                    $("#cont").hide();
                    base.showMsg("您暂时还没有夺宝记录");
                }
                canScrolling = true;
            })
    }
    function addListener() {
    	$(".indianaDetail").on("click","li",function(){
    		var _liThis = $(this);
    		var jewelCode=$(this).attr("data-code");
    		
			if(_liThis.children(".joinWrap").hasClass("in")){
				
				if(_liThis.children(".joinWrap").hasClass("hidden")){
					
					_liThis.children(".joinWrap").removeClass("hidden")
				}else{
					_liThis.children(".joinWrap").addClass("hidden")
				}
			}else{
				$.when(
    				Ajax.get("615029",{
		    			userId: base.getUserId(),
		    			jewelCode:jewelCode
		    		}),
		    		Ajax.get("615016",{
		    			code:jewelCode
		    		})
    			).then(function(res, res2){
	    			if(res.success && res2.success){
	    				var joinTimes = res.data.length;
	    				var lists = res.data;
	    				
	    				if(res2.data.winNumber){
	    					var mobile = res2.data.user.mobile.substring(0, 3) + "*****" + res2.data.user.mobile.substring(8, 11);
	    					var html='<p class="joinWrap_p2">中奖人: '+mobile+
	    							'</p><p class="joinWrap_p2">中奖号码: '+res2.data.winNumber+
	    							'</p><p class="joinWrap_p2">揭晓时间: '+base.formatDate(res2.data.winDatetime,"yyyy-MM-dd")+
	    							'</p><p class="b_e_b joinWrap_p1">我已参与<i>'+joinTimes+'</i>次，以下是所有夺宝记录</p><p>';
	    				}else{
	    					var html='<div class="fs13 joinWrap"><p class="b_e_b joinWrap_p1">我已参与<i>'+joinTimes+'</i>次，以下是所有夺宝记录</p><p>';
	    				}

			            for(var i = 0; i <lists.length ; i++){
			            	var val = lists[i];
			            	
			        		var s="";
			                
			                s += '<span>'+val.number+'</span>';
					        
			            	html += s;
			            }
			            
			            _liThis.children(".joinWrap").append(html+'</p>');
						_liThis.children(".joinWrap").addClass("in");
						_liThis.children(".joinWrap").removeClass("hidden");
	    				
	    			}
	    		})
			}
    			
    			
    	})
    	
        //页面下拉加载
        $(window).on("scroll", function() {
            // var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageRecord();
            }
        });
    }
    function addLoading() {
        $(".indianaDetail").append('<p class="scroll-loadding"></p>');
    }

    function removeLoading() {
        $(".indianaDetail").find(".scroll-loadding").remove();
    }
});
