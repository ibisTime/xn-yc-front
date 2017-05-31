
define([ 'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/util/dict',
], function(base, Ajax, dialog, dict) {
    $(function () {
        var hzbCode = base.getUrlParam("hzbCode");
        
        init();
        
        function init(){
            addListener();
        }
        
        function addListener() {
        	
        	var date = new Date();
        	data = date.setTime(date.getTime()-24*60*60*1000)
			
            var param = {
                "hzbCode": hzbCode,
                "start": "0",
                "limit": "30",
                "dateEnd": base.formatDate(date,"yyyy-MM-dd"),
            };
			
			$.when(
				Ajax.post('615125', {json:param}),
				base.getDictList("802006","currency")
			).then(function (res, res2) {
                if (res.success && res2.success) {
                    var lists = res.data.list;
                    var dictData = res2.data;
                    var html = "";
                    
                    for (var i = 0; i<lists.length; i++) {
                    	
                        var code = lists[i].code;
                        var s = "";
                        s += '<li class="wp100 ptb10 plr15 bg_fff mb10"><div class="fs14">摇出人：<i class="yyUser">'+lists[i].user.mobile+'</i></div>'+
				    		'<div class="fs14">摇出金额：<i class="yyUser">'+base.formatMoneyD(lists[i].yyAmount)+base.getDictListValue(lists[i].yyCurrency,dictData)+'</i></div>'+
				    		'<div class="fs14">摇出时间：<i class="yyUser">'+base.formatDate(lists[i].createDatetime,"yyyy-MM-dd hh:mm:ss")+'</i></div></li>';
                        
                        html += s;
                    }
                    $(".YyTimesWrap").append(html);

                } else {
                    base.showMsg(res1.msg && res2.msg && res3.msg && res4.msg)
                }
            });

        }

    });
});