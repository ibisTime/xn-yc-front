
define([ 'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/util/dict',
], function(base, Ajax, dialog, dict) {
	var hzbCode;
    init()
    
    function init(){
        addListener();
    }
    
    function addListener() {
    	
    	$(".play-way").on("click",function(){
            $(".playWays").css("display","block")
            $(".playWays button").on("click",function () {
                $(".playWays").css("display","none")
            })
        })
    	
    	$(".close").click(function(){
			$(".Mpopup").css("display","none")
		})
    	
    	$("#historyHb").click(function(){
    		location.href= "./historyHb.html?hzbCode="+hzbCode;
    	})
    	$("#todayHb").click(function(){
    		location.href= "./todayHb.html?hzbCode="+hzbCode;
    	})
    	$("#todayYyTimes").click(function(){
    		location.href= "./todayYyTimes.html?hzbCode="+hzbCode;
    	})
    	$("#historyYyTimes").click(function(){
    		location.href= "./historyYyTimes.html?hzbCode="+hzbCode;
    	})

        $.when(
            Ajax.get('615118', {"userId": base.getUserId()}),
            Ajax.get('805056', {"userId": base.getUserId()}),
            base.getDictList("615907","hzb_status"),
            Ajax.get('615119', {"userId": base.getUserId()}),
			base.getSysConfig("807717","yyy_rule"),
            Ajax.get('615105', {
            	"start": "1",
    			"limit": "1",
            })
        ).then(function (res1, res2, res3, res4, res5, res6) {
            if (res1.success && res2.success && res3.success && res4.success && res5.success && res6.success) {
            	
                hzbCode = res1.data[0].code;
                
            	var dictData = res3.data,
                dname = res2.data.mobile,
                dstatus = base.getDictListValue(res1.data[0].status,dictData),
                backAmount1 = res6.data.list[0].backAmount1 - res1.data[0].backAmount1,
                backAmount2 = res6.data.list[0].backAmount2 - res1.data[0].backAmount2,
                backAmount3 = res6.data.list[0].backAmount3 - res1.data[0].backAmount3;
                
                $(".playWays-Content").html(res5.data.note);
                
                $(".dname").html(dname);
                $(".dstatus").html(dstatus);
                $(".backAmount1").html(base.formatMoneyD(backAmount1));
                $(".backAmount2").html(base.formatMoneyD(backAmount2));
                $(".backAmount3").html(base.formatMoneyD(backAmount3));
                $(".historyYyTimes").text(res4.data.historyYyTimes+'次');
                $(".todayYyTimes").text(res4.data.todayYyTimes+'次');
                $(".historyHbTimes").text(res4.data.historyHbTimes+'次');
                $(".todayHbTimes").text(res4.data.todayHbTimes+'次');
                
                $(".redPapper").on("click",function(){
		            location.href= "./redPapper.html?hzbCode="+hzbCode;
		        })
                
            } else {
                base.showMsg(res1.msg && res2.msg && res3.msg && res4.msg && res5.msg && res6.msg);
            }
        });


    }

});