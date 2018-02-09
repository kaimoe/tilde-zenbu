//small server meant to receive text/image files, handle directory structure,
//pass them appropriately to the converter, and send them home to tilde
const express = require('express'),
	fileUpload = require('express-fileupload'),
	app = express(),
	{ exec } = require('child_process'),
	config = require('config.json'),
	path = __dirname + '/'//full path to project directory ending in /
var res
app.use(fileUpload())

app.get('/', function(req, rs) {
	rs.sendFile(__dirname + '/index.html')
}).post('/upload', function(req, rs) {//NOTE: handle dropdown selection with req.body.'name'
	res = rs
	if(!req.files)
		return sendErr('no files were uploaded')

	let file = req.files.file//could be single object, or array if multiple files, so...
	if(isIterable(file))//...we do this messy fix
		for(let x of file)
			handle(x)
	else
		handle(file)
	res.sendStatus(200)
})

function handle(file) {
	let match = file.mimetype.match(/text|image/),
		location = `${match[0]}/${file.name}`// local path + name
	if(match) {
		store(file, location)
		if(match[0] == 'text')
			exec(`${path}converter ${file.name}`, (error, stdout, stderr) => {
				if (error) {
					sendErr(`during converter run, ${error.code + stderr + stdout}`)
				}
				console.log(stdout, stderr)//DEBUG
				send('out/index.html')//send out compiled index
			})
		else
			send(location)//send out image
	} else return sendErr(`none or unsuccesful match against mimetype ${file.mimetype}`)
}

function store(file, location) {//write incoming file
	file.mv(path+location, function(err) {
		if (err)
			return res.status(500).send(err)
	})
}

function send(location) {//copy file to tilde
	exec(`scp ${path+location} ${config.tilde.username}@tilde.town:${config.tilde.path+location}`, (error, stdout, stderr) => {
		if (error) {
			sendErr(`during scp, ${error}`)
		}
		console.log(error, stdout, stderr)//DEBUG
	})
}

function sendErr(string) {
	res.status(400).send(`Something went wrong${string ? ': '+string : ''}`)
}

function isIterable(obj) {
	// checks for null and undefined
	if (obj == null) {
		return false
	}
	return typeof obj[Symbol.iterator] === 'function'
}

app.listen(config.port)
console.log(`Server running at port ${config.port}`)
