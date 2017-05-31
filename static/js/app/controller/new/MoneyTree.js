define([ 'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/util/dict',
], function(base, Ajax, dialog, dict) {
    $(function () {
        init()
        function init(){
            addListener();
        }
        function addListener() {
			$(".close").click(function(){
				$(".Mpopup").css("display","none")
			})

            // var userId =  sessionStorage.getItem("userId");
            var token =  sessionStorage.getItem("token");
            var param = {
                "token":token,
                "companyCode": COMPANYCODE,
                "start": "0",
                "limit": "10",
                "status":"1"

            };
			
			$.when(
				Ajax.post('615105', {json:param}),
				base.getSysConfig("807717","yyy_rule"),
				base.getSysConfig("807717","yyy_statement")
			).then(function (response,res,res1) {
                    if (response.success && res.success) {
                        var list = response.data.list[0];
                        
                        $(".playWays-Content").html(res.data.note);
                        $(".MZContent").html(res1.data.note)
                        if(response.data.list.length>0){
                        	var  img = list.pic,
	                           price = list.price/1000
	                            var hzbTemplateCode =list.code;
	                        $("#treePic").attr("src",PIC_PREFIX+img);
	                        $(".price").text(price);
	
	                        $(".toBuyTree").on("click",function(){
	                            $(".MZSM").css("display","block")
	                            $(".MZSM button").on("click",function () {
	                                location.href = "../pay/sureBuyed.html?hzbTemplateCode="+hzbTemplateCode+"&price="+price;
	                            })
	                        })
	                        $(".play-way").on("click",function(){
	                            $(".playWays").css("display","block")
	                            $(".playWays button").on("click",function () {
	                                $(".playWays").css("display","none")
	                            })
	                        })
                        } else {
                        	$("body div").hide();
	                        base.showMsg("暂无摇钱树!");
	                    }
                    	

                    } else {
                        base.showMsg(response.msg);
                    }
                });



        }

    });
});