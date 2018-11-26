/*Routing
 * /controllers：自动设置controllers文件夹下面路由，请求/map/index会转到对应controllers下map.js内的index函数
 * /public:放置静态文件
 * /views:放置视图文件		
 * request.template 显示视图函数
 * request.viewPath 存储请求路径变量
 * url请求中按controller优先查找,若无则视为folder,找到action后,后面的url为参数
 * 例如:	 /index/index/type/1/method/get		找到index的controller下面的index的action,get参数为type=1,method="get";
 */

var Routing = exports,
	config = Routing.config = require('./config.js'),
	express = require('express'),
	url = require('url'),
	path = require('path'),
	errorCode = Routing.errorCode = require('./error.js').errorCode,
	stringBuffer = require('./lib/libString.js').stringBuffer,
	app = Routing.app = {},
	inited = false;


Routing.init = function() {

	//存储controller对象
	app = Routing.app = express.createServer(),
		controllers = Routing.controllers = require('./controllers.js').controllers,
		template = require(config.template);

	app.configure(function() {
		app.set('view engine',config.templateExtension);
		app.set('view',config.viewsDir);		
		app.register('html',template);					
		app.use(express.cookieParser());				
		app.use(express.bodyParser());					
		app.use(express.session({secret:config.session_secret}));	
	});

	app.configure('development', function() {
		app.use(express.static(config.rootPath + '/public'));
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	app.configure('production', function() {
		app.use(express.static(config.rootPath + '/public',{maxAge:config.static_maxage}));
		app.use(express.errorHandler()); 
		app.set('view cache',true);
	});

	//错误解析设置
	if(!config.debug) {
		app.error(function(err, req, res, next) {
			for(var i in errorCode) {
				if(err.message == i) {
					return errorCode[i](req,res,next);
				}
			}
			return errorCode['500'](req,res,next);
		});
	};

	inited = true;
};


//不用route解析的文件
var publicFile = new RegExp(/\..*$/),
	custom = [],
	ports;

//配置config函数
Routing.configure = function(obj) {
	for(var i in obj) {
		if(i == 'rootPath') {
			if(config['controllersDir'].match(config['rootPath']+'/controllers'))	
				config['controllersDir'] = obj[i] + '/controllers';
			if(config['viewsDir'].match(config['rootPath'])+'/views')
				config['viewsDir'] = obj[i] + '/views';
		}
		config[i] = obj[i];
	}
}

//设置自定义路由解析
Routing.customRoute = function(fn) {			//fn函数内用this或者Routing.app来指定express的server对象
	custom.push(fn);
}

Routing.listen = function(p) {
	if(ports) return;
	ports = p;

	if(!inited) {
		console.log('Please use init() first');
		return;
	}

	//设置自定义路由解析
	for(var i in custom) custom[i].call(app);

	//路由解析设置
	app.all('/*',function(req,res) {
		var reqUrl = url.parse(req.url).path;
		if(publicFile.test(reqUrl)) return;	//如果请求为静态文件不使用路由转向
		reqUrl = path.normalize(reqUrl);		//格式化url路径
		
		var urlPath = stringBuffer(reqUrl.split('/')).remove().getArray();
		if(urlPath.length == 0) {		//设置默认路由转向
			return res.redirect('/' + config.controller_default);
		}
		//路由文件查找
		var routeFunction = controllers.findSet({path:urlPath,request:req});
		if(routeFunction) {
			res.template = function(obj) {
				return res.render(req.viewPath.join('/'),obj);
			};
			return routeFunction(req,res);
		} else {
			throw new Error('404');
		}
	});

	//开启服务
	app.listen(ports);
}


