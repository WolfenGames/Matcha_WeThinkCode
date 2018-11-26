var config = require('./index.js').config,
	fs 	   = require('fs'),
	stringBuffer   = require('./lib/libString.js').stringBuffer,
	controllersDir = config.controllersDir,	//controller路径
	controllers    = new ControllersFunction();		//存储c下面的所有controllers
	
//controllers对象构造函数
function ControllersFunction() {};

//controllers方法
ControllersFunction.prototype.findSet = function(params) {
	var	path 	= params.path,				//url路径
		obj 	= params.objPath || this;		//查找对象
		request = params.request;		//request对象

	//viewPath存储对应view的路径
	if(typeof request.viewPath == 'undefined') request.viewPath = stringBuffer();
	if(path.length > 2) {
		if(typeof obj[path[0]] != 'undefined') {		//查找到path[0]的controller
			request.viewPath.append(path[0]);
			if(obj[path[0]][path[1]] instanceof Function) {			//查找到path[0]下对应的action
				request.viewPath.append(path[1]);
				for(var i = 2;i < path.length;) request.params[path[i++]] = path[i++];
				return obj[path[0]][path[1]];
			} else if(typeof obj[config.folderPrefix + path[0]] != 'undefined') {			//不是action则判断path[0]是否为folder
				request.viewPath.append(path[0]);
				return arguments.callee({
							objPath:obj[config.folderPrefix + path.shift()],
							path:path,
							request:request
					   })
			}
		} else if(typeof obj[config.folderPrefix + path[0]] != 'undefined') {		//不是controller则判断是否为folder
				request.viewPath.append(path[0]);
				return arguments.callee({
							objPath:obj[config.folderPrefix + path.shift()],
							path:path,
							request:request
					   })
		}
	} else if(path.length == 2) {
		if(typeof obj[path[0]] != 'undefined') {				//判断path[0]是否controller
			request.viewPath.append(path[0]);
			if(obj[path[0]][path[1]] instanceof Function) {
				request.viewPath.append(path[1]);
				return obj[path[0]][path[1]];
			} else if(typeof obj[config.folderPrefix + path[0]] != 'undefined') {
				request.viewPath.append(path[0]);
				return arguments.callee({
							objPath:obj[config.folderPrefix + path.shift()],
							path:path,
							request:request
					   })
			}
		} else if(typeof obj[config.folderPrefix + path[0]] != 'undefined') {	//判断path[0]是否folder
				request.viewPath.append(path[0]);
				return arguments.callee({
							objPath:obj[config.folderPrefix + path.shift()],
							path:path,
							request:request
					   })
		}
	} else if(path.length == 1) {
		if(typeof obj[path[0]] != 'undefined') {						//判断path[0]是否controller
			request.viewPath.append(path[0]);
			if(obj[path[0]][config.web_default] instanceof Function) {		//判断是否有默认action
				request.viewPath.append(config.web_default);
				return obj[path[0]][config.web_default];
			}
		}
	};
	return false;
};

//是否controller js文件检测正则对象
var jsFile = new RegExp(/Controller\.js$/);

//是否文件夹检测正则对象
var folder = new RegExp(/^[a-z0-9]+$/);

var action = new RegExp(config.actionExtension + '$');

//controllor对象名临时存储变量
var controllerName ;

//controller路径解析函数
(function resolveControllersDir(controllersDir,controllers) {		//参数controllersDir为解析路径，controllers为存放变量
	try {
		var data = fs.readdirSync(controllersDir);
	} catch(e) {
		console.log('ERROR_READDIR:'+controllersDir);
		return;
	}
	for(var i in data) {		//遍历所有文件/文件夹名
		if(jsFile.test(data[i])) {		//检测后缀名是否为js，若是则存入controllers中
			controllerName = data[i].substr(0,data[i].length - config.controllerExtension.length - 3);
			controllers[controllerName] = {};
			var control = require(controllersDir + '/' + data[i]);
			for(var j in control) {
				if(action.test(j)) controllers[controllerName][j.substr(0,j.length - config.actionExtension.length)] = control[j];
			}
			delete control;
		} else if(folder.test(data[i])) {	//检测是否无格式
			if(fs.statSync(controllersDir + '/' + data[i]).isDirectory()) {
				var dirControllers = controllers[config.folderPrefix + data[i]] = {};		//创建controllers对应存储对象
				resolveControllersDir(controllersDir + '/' + data[i],dirControllers);
			}
		}
	}
	
})(controllersDir,controllers);

//垃圾回收
delete jsFile,folder,controllerName;	

exports.controllers = controllers;

