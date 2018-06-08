var express = require('./lib/express')
var path = require('path')
var bodyParser = require('./lib/body-parser')
var mimeType = require('./lib/mime')

var app = express()

app.use(mimeType)
app.use(bodyParser)
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))

app.use(function(req, res, next) {
  console.log('middleware 1')
  next()
})

app.use(function(req, res, next) {
  console.log('middleware 12')
  next()
})


app.use('/hello', function(req, res){
  console.log('/hello..')
  res.send('hello world')
})

app.use('/getWeather', function(req, res){
  res.send({url:'/getWeather', city: req.query.city})
})

app.use('/about', function(req, res){
  res.render('about.html', {
    title: '乡村爱情',
    teacher: '冯大辉',
    date: '我的老家唉',
    intro: 'http://www.newming.cn'
  })
})

app.use(function(req, res){
  res.send(404, 'haha Not Found')
})


module.exports = app