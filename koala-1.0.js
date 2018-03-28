/**
 * user defind Object uses to perform some function;
 * 
 * @return {TypeName} 
 */
;
window.koala = window.$K = (function($) {
	/*设置JQuery的AJAX全局默认选项*/
	$.ajaxSetup( {
		//url : "/s2sh", // 默认URL
		async : false, // 默认同步加载
		type : "POST", // 默认使用POST方式
		cache : false, //关闭AJAX相应的缓存
		headers : { // 默认添加请求头
			"Author" : "Junnyblue",
			"Powered-By" : "Junnyblue"
		},
		error : function(jqXHR, textStatus, errorMsg) {
			/* 
			 * 出错时默认的处理函数
			 * jqXHR 是经过jQuery封装的XMLHttpRequest对象
			 * textStatus 可能为： null、"timeout"、"error"、"abort"或"parsererror"
			 * errorMsg 可能为： "Not Found"、"Internal Server Error"等 
			 * 提示形如：发送AJAX请求到"/index.html"时出错[404]：Not Found
			 */
			koala.log(textStatus, 'Error when sending request to "' + this.url + '", [' + jqXHR.status + ']:' + errorMsg);
		}
	});
	var _win = window;
	var _string = String.prototype;
	var email_pattern = /^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/;

	_string.equals = function(otherStr) {
		return otherStr.toString() == this;
	}

	/**
	 * 去掉字符串前后的指定字符或空格
	 * @param {Object} synx 需要去掉的字符(如果为特殊字符需要进行转义，如'\\.', '\\$')，如果不指定则为空格
	 * @memberOf {TypeName} 
	 * @return {TypeName} 处理后的字符串
	 */
	_string.trim = function(synx) {
		synx = synx || "\\s";
		var reg = new RegExp("(^" + synx + "*)|(" + synx + "*$)", "g");
		return this.toString().replace(reg, '');
	}

	/**
	 * 得到len长度的随机字符串
	 * 
	 * @param {Object} len 字符串长度
	 * @return {TypeName} 
	 */
	var getRandomString = $.getRandomString = function(len) {
		len = len || 32;
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1  
		var maxPos = $chars.length;
		var pwd = '';
		for (i = 0; i < len; i++) {
			pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	};

	/**
	 * 动态加载URL到当前控件，并在加载完毕时执行回调函数
	 * 
	 * @param {Object} target
	 * @memberOf {TypeName} 
	 */
	$.fn.dynamicLoad = function(target) {
		if (!!target) {
			var url = target.url || arguments[0];
			var success = target.callback || target.success || target.ready || arguments[1] || function() {};
			var error = target.error || arguments[2] || function() {}
			$(this).load(url, function(response, status, xhr) {
				if ("success".equals(status)) {
					success.apply(this, arguments);
				} else {
					error.apply(this, arguments);
				}
			});
		}

	};

	var koala = {
		/**
		 * invoke window.location.replace(url)
		 * 
		 * @param {Object} url
		 */
		replaceUrl : function(url) {
			_win.location.replace(url)
		},
		log : function(level, message) {
			var logImg = new Image();
			logImg.src = "http://localhost:8080/conts/logAction?level=" + level + "&message=" + message;
		},
		testEmail : function(email) {
			return email_pattern.test(email);
		},
		format : function(source) {
			if (arguments.length > 1) {
				var arg = arguments[1];
				if (typeof arg === 'string') {
					for ( var i = 1; i < arguments.length; i++) {
						source = source.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), arguments[i]);
					}
				} else {
					for (key in arg) {
						source = source.replace(new RegExp("\\{" + key + "\\}", "g"), arg[key]);
					}
				}

			}
			return source;
		},
		isExists : function(obj) {
			return !!obj && 0 < obj.length;
		}

	};
	return koala;
})(jQuery);
