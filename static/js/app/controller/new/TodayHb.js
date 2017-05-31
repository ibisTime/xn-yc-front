
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
			
            var param = {
                "hzbCode": hzbCode,
                "owner": base.getUserId(),
                "companyCode":COMPANYCODE,
                "start": "0",
                "limit": "20",
                "status": "2",
                "createDatetimeStart": base.formatDate(date,"yyyy-MM-dd"),
                "createDatetimeEnd": base.formatDate(date,"yyyy-MM-dd"),
            };
			
			$.when(
				Ajax.post('615135', {json:param}),
				base.getDictList("615907","hzb_mgift_status")
			).then(function (res, res2) {
                if (res.success && res2.success) {
                    var lists = res.data.list;
                    var dictData = res2.data;
                    var html = "";
                    
                    for (var i = 0; i<lists.length; i++) {
                    	
                        var status= lists[i].status;
                        var slogan = lists[i].slogan;
                        var code = lists[i].code;
                        var s = "";
                        
                        //
                        if(status==1){
                        	s +='<li class="plr20 pt10 br_4p wp100 mt10 clearfix bg_end"><div class="wp100 fl s_12">';
                        	s +='<p class="t_white"><span>'+slogan+'</span></p>';
					        s +='<p class=" t_white pt10">红包编号:<span class="ml20">'+code+'</span></p>';
				        	s +='<p class=" t_white pt8 fs13">状态<span class="status">'+base.getDictListValue(status,dictData)+'</span></p></div></li>';
				        
				        }else if(status==2){
				        	s +='<li class="plr20 pt10 br_4p wp100 mt10 clearfix bg_end"><div class="wp100 fl s_12">';
				        	s +='<p class="t_white"><span>'+slogan+'</span></p>';
					        s +='<p class=" t_white pt10">红包编号:<span class="ml20">'+code+'</span></p>';
				        	s +='<p class=" t_white pt8 fs13">状态:<span class="status">'+base.getDictListValue(status,dictData)+"  领取人:"+lists[i].receiverUser.mobile+'</span></p></div></li>';
				        
				        }else if(status==3){
				        	s +='<li class="plr20 pt10 br_4p wp100 mt10 clearfix bg_end"><div class="wp100 fl s_12">';
				        	s +='<p class="t_white"><span>'+slogan+'</span></p>';
					        s +='<p class=" t_white pt10">红包编号:<span class="ml20">'+code+'</span></p>';
				        	s +='<p class=" t_white pt8 fs13">状态:<span class="status">'+base.getDictListValue(status,dictData)+'</span></p></div></li>';
				        
				        }
				        
                        html += s;
                    }
                    $(".redPapperWrap").append(html);


                } else {
                    base.showMsg(res1.msg && res2.msg && res3.msg && res4.msg)
                }
            });

        }

    });
});