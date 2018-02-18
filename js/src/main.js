//small server meant to receive text/image files, handle directory structure,
//pass them appropriately to the converter, and send them home to tilde
const express = require('express'),
	fileUpload = require('express-fileupload'),
	app = express(),
	{ exec } = require('child_process'),
	config = require('./config.json'),
	d = process.argv[2]//debug flag
var res, soft
app.use(fileUpload())

app.get('/', function(req, rs) {
	rs.sendFile(__dirname + '/index.html')
}).post('/upload', function(req, rs) {
	res = rs
	if(!req.files)
		return sendHead('no files were uploaded')
	if(req.body.soft)
		soft = true
	let file = req.files.file//could be single object, or array of multiple files, so...
	if(isIterable(file)) {//...we do this messy fix
		debug('iterable')
		for(let x of file)
			handle(x, req.body)
	} else {
		debug('single file')
		handle(file, req.body)
	}
	setTimeout(() => {
		sendHead('', 1)
	}, 10000)//THIS IS A REALLY BAD SOLUTION TO ASYNCHRONICITY BULLSHIT BUT YOU CAN'T BLAME ME
}).post('/special', function(req, rs) {
	res = rs
	debug(req.body)
	if(req.body.compile) {
		debug('compiling')
		exec(`${config.path}main compile`, (error, stdout, stderr) => {
			if (error) {
				sendHead(`during converter run, ${error.code + stderr + stdout}`)
			}
			debug(stdout + ' ' + stderr)
			scp('index.html')//send out compiled index
			sendHead('', 1)
		})
	} else {
		sendHead('no parameter passed')
	}
})

function handle(file, body) {
	let match = file.mimetype.match(/text|image/)
	if(!match)
		return sendHead(`none or unsuccesful match against mimetype ${file.mimetype}`)
	else {
		let name = file.name.replace(' ', '-'),
			loc = `${match[0]}/${name}`// local path + name
		debug('handling '+name)
		store(file, loc, () => {//asynchronicity make me want to be dead
			if(match[0] == 'text') {
				debug('exec')
				let cmd = `${config.path}main add "${name}"${body.music?' "'+body.music+'" ':''}${body.musicurl?' "'+body.musicurl+'" ':''}`
				debug(cmd)
				if(!soft)
					exec(cmd, (error, stdout, stderr) => {
						if (error) {
							sendHead(`during converter run, ${error.code + stderr + stdout}`)
						}
						console.log(stdout + ' ' + stderr)
						scp('index.html')//send out compiled index
					})
			} else
				scp(name, 1)//send out image
		})
	}
}

function store(file, loc, done) {//write incoming file
	if(soft)
		done()
	else {
		file.mv(config.path+loc, function(err) {
			if (err)
				return res.status(500).send(err)
			debug('stored')
			done()
		})
	}
}

function scp(name, img) {//copy file to tilde
	if(!soft)
		exec(`scp ${config.path}${img?'image/':'out/'}${name} ${config.tilde.username}@tilde.town:${config.tilde.path}${img?'zenbu/img/':''}${name}`, (error, stdout, stderr) => {
			if (error) {
				sendHead(`during scp, ${error}`)
			}
			debug(error + ' ' + stdout + ' ' + stderr)
		})
}

function sendHead(string, ok) {
	if(res.headersSent)
		return
	if(ok)
		res.status(200).end()
	else
		res.status(400).send(`Something went wrong${string ? ': '+string : ''}`)
}

function isIterable(obj) {
	// checks for null and undefined
	if (obj == null) {
		return false
	}
	return typeof obj[Symbol.iterator] === 'function'
}

function debug(string) {
	if(d)
		console.log(string)
}

app.listen(config.port)
debug(`Server running at port ${config.port}`)
