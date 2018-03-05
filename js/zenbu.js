//small server meant to receive text/image files, handle directory structure,
//pass them appropriately to the converter, and send them home to tilde

//run it with the -d flag for debugging output
const express = require('express'),
	fileUpload = require('express-fileupload'),
	helmet = require('helmet'),
	zenbu = express(),
	fs = require('fs'),
	config = require('./config.js'),
	https = config.ssl.enabled ? require('https') : '',
	localpath = __dirname + '/',
	main = require('./src/main.js')
let ssl = {}

zenbu.use(fileUpload())
zenbu.use(helmet())

zenbu.get('/', function(req, res) {
	res.sendFile(__dirname + '/src/index.html')
}).get('/index.js', function(req, res) {
	res.sendFile(__dirname + '/src/index.js')
})
for(let x of main.pages) {
	zenbu.post('/' + x, (req, res) => {
		main[x](req, res, localpath)
	})
}

if(config.ssl.enabled) {
	zenbu.use(function(req, res, next) {//https redirect
		if(!req.secure) {
			return res.redirect(['https://', req.get('Host'), req.url].join(''))
		}
		next()
	})

	let path = config.ssl.path || localpath
	if(!path.endsWith('/')) path = path + '/'
	ssl.key = fs.readFileSync(`${path}privkey.pem`)
	ssl.cert = fs.readFileSync(`${path}fullchain.pem`)

	https.createServer(ssl, zenbu).listen(config.port, () => console.log(`Zenbu started on port ${config.port}`))
} else {
	zenbu.listen(config.port , () => console.log(`Zenbu started on port ${config.port}`))
}
