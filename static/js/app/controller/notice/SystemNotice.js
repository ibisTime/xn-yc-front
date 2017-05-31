define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading'
], function(base, Ajax, loading) {
	
	if(!base.getUserId()){
		location.href="user/login.html"
	}
	
	var start = 1;//第几页
	var startNum;//总页数
	var sum;////总条数
	var limitNum = 10;//每页个数
	var num=0;//已加载消息数
	
	var list = "";
	
	ajaxUpdata(start,limitNum);
	
	$(".updateMore").on("click",function(){
		
		if(start<startNum){
			start++;
			ajaxUpdata(start,limitNum);
		}else{
			start=start;
			$(".updateMore p").html("没有更多  ···")
		}
	})
	
	
	function ajaxUpdata(sta,lim){
		
		Ajax.get("804040",{
			"pushType": 41,
    		"toKind": 1,
    		"channelType": 4,
    		"status": 1,
			"fromSystemCode":SYSTEM_CODE,
			"start":sta,
			"limit": lim
		}).then(function(res){
			if(res.success){
				
				var smsTitle;//标题
				var pushedDatetime;//公告时间
				var smsContent;//公告内容
				
				startNum = res.data.totalPage;//总页数
				sum = res.data.totalCount;//总条数
				
				var img = __inline("../images/消息@2x.png");
				for (var i = 0; i < limitNum; i ++) {
					
					var s = "";
					
					if(num>sum-1){//消息加载总条数多余消息总条数时跳出循环
						num=num;
//						console.log("已跳出循环,已加载消息条数"+num,"总消息条数"+sum);
						break;
					}else{
//							console.log("已加载消息条数"+num,"总消息条数"+sum)
						
						smsTitle = res.data.list[i].smsTitle;//标题
						pushedDatetime = res.data.list[i].pushedDatetime;//公告时间
						smsContent = res.data.list[i].smsContent;//公告内容
						
						pushedDatetime = base.formatDate(pushedDatetime, "yyyy-MM-dd");
						
						s += "<div class='flex b_e6_b' style='margin: 20px 0 10px 10px;padding-right:10px'>";
						s += "<div class='pr10 flex-s newp' style='max-width:60px;'><img src='"+img+"' class='newp'/></div>";
			    		s += "<div  style='padding-bottom: 25px;'><div>";
			        	s += "<div class='fs15'>"+smsTitle+"</div>";
			        	s += "<div class='fs13'  style='color: #999999'>"+pushedDatetime+"</div>";
			    		s += "</div><div class=' bg_f5 ptb15 plr10 fs13 mt10' style='color: #999;border-radius:4px;line-height:20px;'>"+smsContent+"</div></div></div>";
						
						list += s;
						
						num++;
					}
				}
				
				$("#noticeWrap").html(list);
				
				if(num>sum-1){
					$(".updateMore p").html("没有更多  ···");
				}else{
		        	$(".updateMore p").html("加载更多  ···")
		        }
			}else{
				base.showMsg(res.msg);
			}
		
		})
	}
});


