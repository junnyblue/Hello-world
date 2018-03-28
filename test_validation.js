$(function() {
	/*全局参数设定, 启动验证框架*/
	$.validationSetup( {
		/*注册新的验证类型，如果和已有的类型相同将会覆盖*/
		validators : {
			password : {
				// 验证对象
				target : "#pwd",
				//配置级联操作的对象
				cascade : "#comfirm-pwd",
				//级联操作会触发reset操作，这里设定reset操作的参数
				cascade_handler : {
					empty : false, // 是否清空控件的值
					handler : function() { // 级联控件的后续操作
						if ($(this).val()) {
							$(this).validate("equalTo");
						}
					}
				}
			},
			test : {
				target : $("#username"),
				label : "名字",
				message : "这个{0}不可用",
				handler : function(value) {
					return value != "admin";
				}
			}
		},
		// 统一的验证成功的操作
		success : function(name, msg) {
			msg.css("color", "green").html("OK").show();
		},
		// 统一的错误提示样式
		errorCss : {
			color : "red"
		},
		// 添加或修改默认错误提示信息
		messages : {
			required : "要死啊，不填{0}?"
		}
	});

	// 将爱好checkbox的验证统一委派给div#habits
	$("[name='habit']").delegate( {
		target : "#habits",
		target_events : "select",
		target_type : "number",
		handler : function(len) {
			return len >= $(this).attr("min-num");
		},
		getValue : function() {
			return $(this).find("input:checked").length;
		},
		error : function(name, msg) {
			var min = $(this).attr("min-num");
			msg.html("请选择至少" + min + "个" + name).css($.validation.errorCss).show();
		}
	});
});
