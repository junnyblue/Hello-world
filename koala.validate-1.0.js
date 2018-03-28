/*
 * jQuery validate plugin 1.0
 * 
 * 通用的验证框架，完成异步的前台以及后台的数据验证。
 * 可扩展，可定制，灵活方便，能够节省大量验证编码工作
 *
 * Copyright (c) 2017 Junny.L.Blue
 *
 */
;
(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD (Register as an anonymous module)
		define( [ "jquery" ], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($) {
	var poweredBy = "Junny.L.Blue";
	var version = "1.0";

	var DEFULT_VALIDATE_EVENTS = "change";
	var VALIDATIONS_NAME = "validateResults";
	var PROFIX_NAMESPACE = "val_";

	var DEFINED_EVENTS_RESET = "reset";
	var DEFINED_EVENTS_ALIVE = "alive";
	var DEFINED_EVENTS_IGNORE = "ignore";
	/*全局参数*/
	var validation = $V = $.validation = {

		//注册验证类型对应的validator
		validators : {
			required : ".required,[required]",
			email : ".email",
			digits : ".digits",
			maxsize : {
				type : "maxsize",
				getMessageParameters : function() {
					var name = $(this).getLabel();
					var max = $(this).attr("max");
					return {
						name : name,
						max : max
					};
				}
			},
			range : {
				type : "range",
				getValue : function() {
					var $this = $(this);
					return {
						value : parseInt($this.val()),
						minvalue : parseInt($this.attr("minvalue")),
						maxvalue : parseInt($this.attr("maxvalue"))
					};
				},
				getMessageParameters : function() {
					var $this = $(this);
					return {
						name : $this.getLabel(),
						minvalue : $this.attr("minvalue"),
						maxvalue : $this.attr("maxvalue")
					};
				}
			},
			equalTo : ".equalTo"
		},
		message : function(msg) {
			this.message = $.extend( {}, this.messages, msg);
		},
		/*
		 * 默认的验证错误动作
		 * @param {Object} label 出错控件的标示名字，通常是控件所对应label标签中的内容，
		 * 						或显式设置在控件中的data-title或data-label属性值。也可以在注册validator时用label属性指定。
		 * @param {Object} container 错误提示所放置的控件对象，通常是一个span标签对象，也可以由开发者定制
		 * @param {Object} type 触发验证错误发生的验证类型
		 * @param {Object} message 错误信息文本，支持通配字段。此参数可选，不指定则为通用错误提示
		 * @param {Object} e 触发验证错误发生的验证事件对象
		 */
		error : function(label, container, type, message, e) {
			var errorCss = $V.errorCss || {};
			message = message || $V.messages[type] || $V.messages["_default"];
			container.css(errorCss);
			container.html(koala.format(message, label)).show();
		},
		success : function(label, container, type, e) {},
		/*
		 * 验证类型所对应的验证方法。该方法应返回一个boolean型的值以表明验证结果
		 * @param {Object} value 需要进行验证的值，通常是控件的value属性或innerText，也可以通过指定getValue方法，通过其返回值获取
		 * @memberOf {TypeName} 
		 * @return {TypeName} true 验证通过 false验证失败
		 */
		handlers : {
			input_maxsize : 5,
			required : function(value) {
				value = value.trim();
				var result = !!value;
				if (this.tagName && this.tagName.toUpperCase() == "SELECT") {
					result = result && value != "0";
				}
				return result;
			},
			range : function(input) {
				return input.value >= input.minvalue && input.value <= input.maxvalue;
			},
			email : function(value) {
				var isOK = true;
				if (!!value && !koala.testEmail(value.trim())) {
					isOK = false;
				}
				return isOK;
			},
			digits : function(value) {
				var isOK = true;
				if (!!value && isNaN(value.trim())) {
					isOK = false;
				}
				return isOK;
			},
			maxsize : function(value) {
				var isOK = true;
				var maxSize = $(this).data('max') || $(this).attr('max') || $V.handlers.input_maxsize;
				if (!!value && value.trim().length > maxSize) {
					isOK = false;
				}
				return isOK;
			},
			equalTo : function(thisValue, context) {
				var target = context.equals || $(this).attr("equals") || $(this).data("equals");
				var targetValue = koala.isExists($(target)) ? $(target).val() : target;
				return thisValue == targetValue;
			}
		}
	};
	$.validation.messages = {};
	var init = false;
	/*
	 * 用以配置并启动验证框架。默认启动validator中列出的基本验证，也可以在参数中扩展验证类型。
	 * 扩展的类型如果和原有验证类型一致，后出现的将覆盖先前定义的验证动作。
	 * 
	 * 该方法还可以用于定制一些全局参数
	 * 
	 * @param {Object} config 配置参数设定
	 */
	$.validationSetup = function(config) {

		$.validation = $.extend(true, $.validation, config);

		if (init == false) {
			var validator = $.validation.validators;
			init = true;
		} else {
			var validator = !!config ? config.validators : null;
		}

		if (validator) {
			for (key in validator) {
				var val = validator[key];
				var param = {
					type : key
				};
				if (typeof val === "string") {
					$(val).off(key);
					$(val).validate(param);
				} else {
					val.target = val.target || "." + key;
					$(val.target).off("." + key);
					$(val.target).validate($.extend(param, val));
				}
			}
		}
	};
	$.extend($.validation.messages, {
		_self : "这",
		_default : "{0}的输入有误",
		required : "{0}是必填字段",
		remote : "请修正此字段",
		email : "请输入有效的电子邮件地址",
		url : "请输入有效的网址",
		date : "请输入有效的日期",
		dateISO : "请输入有效的日期 (YYYY-MM-DD)",
		inputNum : "请输入数字",
		number : "请输入有效的数字",
		digits : "{0}只能输入数字",
		creditcard : "请输入有效的信用卡号码",
		equalTo : "你输入的{0}不相同",
		extension : "请输入有效的后缀",
		maxsize : "{name}的值不能超过{max}个字符",
		range : "{name}超出范围({minvalue}~{maxvalue})"
	});

	var p = /\.[\w\-]+/;

	$.fn.extend( {
		validations : function(key) {
			var result = this.data(VALIDATIONS_NAME);
			if (result) {
				return !!key ? result.validations[key] : result.validations;
			} else {
				return null;
			}

		},
		/*
		 * 向指定控件添加验证动作的方法
		 * 
		 * @memberOf {TypeName} 
		 * @return {TypeName} 
		 */
		validate : function() {
			if (!koala.isExists(this)) {
				return;
			}
			if (arguments.length > 0 && typeof arguments[0] !== 'string') {
				var target = {
					events : $V.defaultEvents || DEFULT_VALIDATE_EVENTS
				};
				if ($.isFunction(arguments[0])) {
					target.handler = arguments[0];
					target.events = arguments[1] || target.events;
					target.type = arguments[2];
					target.success = function() {};
					target.error = function() {};
				} else {
					target = $.extend( {}, target, arguments[0]);
				}

				var namespace = target.type || this.selector.match(p) || PROFIX_NAMESPACE + $.getRandomString(4);
				target.namespace = namespace.toString().replace(/\./, '');
				var key = target.key = target.events + "." + target.namespace;

				/*
				 * 绑定ignore事件，用以忽略该控件的验证。一般在控件变成disabled时使用。
				 * @param {Object} event 事件对象
				 * @param {Object} type 需要忽略的验证类型，如果不指定则会忽略注册在该控件上的所有验证
				 */
				this.on(DEFINED_EVENTS_IGNORE, function(event, type) {
					type = type || namespace;
					if (this == event.target && namespace == type) {
						$(this).validations(type).ignore = true;
					}
					return false;
				});
				/*
				 *  绑定重置事件，用以重置该控件的验证状态（置为‘未验证’）。
				 * @param {Object} event事件对象
				 * @param {Object} type 需要重置的验证类型，如果不指定则会重置注册在该控件上的所有验证状态
				 */
				this.on(DEFINED_EVENTS_RESET, function(event, type) {
					if (this == event.target) {
						$(this).validations(namespace).isOK = false;
						$(this).getMessageContainer().hide();
					}
					return false;
				});
				/*
				 * 绑定激活验证事件，用以激活被忽略的验证动作
				 * @param {Object} event 事件对象
				 * @param {Object} type 被激活的验证类型，如不指定则激活注册在该控件上的所有验证
				 */
				this.on(DEFINED_EVENTS_ALIVE, function(event, type) {
					type = type || namespace;
					if (this == event.target && namespace == type) {
						$(this).validations(type).ignore = false;
					}
					return false;
				});

				/*
				 * 为控件绑定验证事件
				 * 
				 * @param {Object} e 事件对象
				 */
				this.on(key, target, function(e) {
					/* 阻止事件冒泡 */
					e.stopPropagation();
					/* 
					 * 验证上下文
					 */
					var context = e.data;

					var validation = $(this).validations(context.namespace);

					if (this == e.target && !!validation && !validation.ignore) {
						/*
						 *  级联动作
						 */
						if (context.cascade) {
							$(context.cascade).reset(context.cascade_handler);
						}
						var handler = context.handler || context.foo || $.validation.handlers[context.namespace] || function() {
							return true;
						};
						var resultHanlder = context.success || $.validation.success;
						var inputHandler = context.getValue || function() {
							return $(this).val() || $(this).html()
						};
						var input = inputHandler.call(this, context);
						var result = handler.call(this, input, context, e);

						validation.isOK = result = !!result;
						var messageParameters;
						if (context.getMessageParameters) {
							messageParameters = context.getMessageParameters.call(this, context);
						}
						messageParameters = messageParameters || context.label || $(this).getLabel();

						var msgContainer = $(this).getMessageContainer();

						if (!result) {
							resultHanlder = context.fault || context.error || $.validation.error;
							/* 阻止其他事件运行 */
							e.stopImmediatePropagation();
						}

						resultHanlder.call(this, messageParameters, msgContainer, context.namespace, context.message, e);
					}
					return false;
				});

				/*为控件添加验证状态*/
				return this.each(function() {

					var data = $(this).data(VALIDATIONS_NAME) || {
						source : this,
						validations : {}
					};
					var result = {
						events : target.events,
				
						type : target.namespace,
						
						ignore : false,
					
						isOK : false
					};
					
					data.validations[target.namespace] = result;

					$(this).data(VALIDATIONS_NAME, data);

				});
			} else {
				var result = true;
				var type = arguments[0];
				$(this).each(function(index, element) {

					var data = $(element).data(VALIDATIONS_NAME);
					if (!!data) {
						for (key in data.validations) {
							type = type || key;
							var item = data.validations[key];
							if (!item.ignore && type == key) {
								$(element).trigger(item.events + "." + type);
								result = result && item.isOK;
								if (!result) {
									break;
								}
							}
						}
					}
				});
				return result;
			}
		},
		/**
		 * 将验证事件委托给其他控件，一般用以一组控件（如checkbox）的统一验证 
		 */
		delegate : function(options) {
			options = $.extend( {}, {
				events : DEFULT_VALIDATE_EVENTS,
				target : "",
				target_events : DEFULT_VALIDATE_EVENTS,
				target_type : $.getRandomString(4),
				getKey : function() {
					return this.target_events + "." + this.target_type
				}
			}, options);
			var target = $(options.target) || null;
			if (target) {
				if (!target.validations() || target.validations(options.getKey()) === undefined) {
					target.validate( {
						handler : options.handler,
						events : options.target_events,
						type : options.target_type,
						success : options.success,
						error : options.error,
						getValue : options.getValue
					});
				}
				$(this).on(options.events, function() {
					target.trigger(options.getKey());
				});
			}
		},
		valResult : function() {
			var result = {
				isOK : true
			};
			$(this).each(function(index, element) {
				var data = $(element).data(VALIDATIONS_NAME);
				if (!!data) {
					for (key in data.validations) {
						var item = data.validations[key];
						if (!item.ignore && !item.isOK) {
							result = {
								source : data["source"],
								events : item.events + '.' + item.type,
								isOK : item.isOK,
								trigger : function() {
									$(this.source).trigger(this.events);
								}
							};
							return false;
						}
					}
				}
			});
			return result;
		},
		getLabel : function() {
			var label = $("label[for='" + this.attr("id") + "']").text() || this.data("title") || this.data("label") || validation.messages._self;
			return label.trim().trim(":");
		},
		getMessageContainer : function(name) {
			name = name || "msg";
			var id = this.data(name) || this.attr(name) || this.attr("id") + "_error_" + name;
			var container = $("#" + id);

			if (!koala.isExists(container)) {
				var defaultPlacement = $.validation.errorPlacement;
				if (!defaultPlacement) {

					container = $("<span></span>").attr("id", id);
					container.insertAfter(this);
					this.data(name, id);
				} else {
					container = $(defaultPlacement);
				}
			}
			return container;
		},
		putValidateMsg : function(name, errorplacement, type, msg) {
			errorplacement = errorplacement || this.getMessageContainer(errorplacement);
			msg = msg || $.validation.error;
			if ($.isFunction(msg)) {
				msg.call(this, name, errorplacement, type);
			} else {
				errorplacement.text(msg).show();
			}
			return errorplacement;
		},
		ignore : function(type) {
			return this.trigger(DEFINED_EVENTS_IGNORE, type);
		},
		alive : function(type) {
			return this.trigger(DEFINED_EVENTS_ALIVE, type);
		},
		reset : function(handler, options) {
			var len = arguments.length;

			if (len == 1) {
				if ($.isFunction(handler)) {
					options = {};
					options.handler = handler;
				} else {
					options = handler;
				}
			}
			if (len == 2) {
				options.handler = handler;
			}
			options = $.extend( {}, {
				empty : true,
				handler : function(value) {
					return value;
				},
				INPUT : function() {
					if (this.type == "checkbox") {
						this.checked = false;
					} else {
						$(this).val("");
					}
				},
				SELECT : function() {
					$(this).val(0);
				},
				TEXTAREA : function() {
					$(this).html("")
				}
			}, options);
			/*重置验证状态*/
			this.trigger(DEFINED_EVENTS_RESET);
			return this.each(function(index, e) {
				if (options.empty) {
					foo = options[e.tagName.toUpperCase()];
					if (foo) {
						foo.call(e, this);
					}
				}
				options.handler.call(e, this);
			});
		}
	});
}));
