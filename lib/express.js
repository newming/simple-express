var url = require('url')
var fs = require('fs')
var path = require('path')
var ejs = require('ejs')

function express() {

  var tasks = []
  // 这里的req,res是从www里边注入进来的
  var app = function(req, res){
    makeQuery(req)
    makeResponse(res)
    addRender(req, res, app)

    var i = 0

    function next() {
      var task = tasks[i++] // 这里注意是i++，拿到的是 tasks[i] 然后 i + 1
      if(!task) {
        return
      }

      //如果是普通的中间件 或者 是路由匹配上的中间件
      if(task.routePath === null || url.parse(req.url, true).pathname === task.routePath){
        task.middleWare(req, res, next)
      }else{
        //如果说路由未匹配上的中间件，直接下一个
        next()
      }
    }

    next()
  }

  app.use = function(routePath, middleWare){
    if(typeof routePath === 'function') {
      middleWare = routePath
      routePath = null
    }
    tasks.push({
      routePath: routePath,
      middleWare: middleWare
    })
  }

  app.data = {}

  app.set = function(key, value){
    app.data[key] = value
  }

  app.get = function(key){
    return app.data[key]
  }
  return app

}

express.static = function(staticPath){

  return function(req, res, next){
    var pathObj = url.parse(req.url, true)
    var filePath = path.resolve(staticPath, pathObj.pathname.substr(1))
    console.log(filePath)
    fs.readFile(filePath,'binary', function(err, content){
      if(err){
        next()
      }else {
        res.writeHead(200, 'Ok')
        res.write(content, 'binary')
        res.end()
      }
    })
  }
}

module.exports = express


function makeQuery(req){
  var pathObj = url.parse(req.url, true)
  req.query = pathObj.query
}

function makeResponse(res){
  res.send = function(toSend){
    if(typeof toSend === 'string'){
      res.end(toSend)
    }
    if(typeof toSend === 'object'){
      res.end(JSON.stringify(toSend))
    }
    if(typeof toSend === 'number'){
      res.writeHead(toSend, arguments[1])
      res.end()
    }
  }
}

function addRender(req, res, app){

  res.render = function(tplPath, data) {

    var fullpath = path.join(app.get('views'), tplPath)
    ejs.renderFile(fullpath, data, {}, function(err, str){
      if(err){
        res.writeHead(503, 'System error')
        res.end()
      }else {
        res.setHeader('content-type', 'text/html')
        res.writeHead(200, 'Ok')
        res.write(str)
        res.end()
      }
    })
  }
}