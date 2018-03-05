const { exec } = require('child_process'),
	config = require('../config.js'),
	d = process.argv.includes('-d')//debug flag
let localpath, res, soft, dry, test, cwd


function upload(req, rs, path) {
	debug(req.body)
	for(let x in req.body) {//checkbox values are returned as 'boolean', so convert
		req.body[x] = req.body[x] === 'true' ? true : (req.body[x] === 'false' ? false : req.body[x])
	}
	debug(req.body)
	res = rs
	if(!req.files)
		return sendHead(400, 'no files were uploaded')

	soft = req.body.soft
	test = req.body.test
	dry = test || req.body.dry

	localpath = path
	cwd = path + (test ? 'test/' : '')

	if(req.body.edit) {
		exists(req.body.editname, (result) => {
			if(result)
				store(req.files['0'], 'text/'+req.body.editname+'.txt', () => {
					run('update', req.body.editname, req.body, () => {
						sendHead(200, '')
					})
				})
			else
				sendHead(404, `no post ${req.body.editname} found`)
		})

	} else {
		debug(req.files)
		let file = req.files//could be single object, or contain multiple, so...
		if(isIterable(file)) {//...we do this messy fix
			debug('iterable')
			let runs = file.length, i = 0
			for(let x of file)
				handle(x, req.body, () => {
					if(runs === ++i)
						sendHead(200, '')
				})
		} else {
			debug('single file')
			handle(file['0'], req.body, () => {
				sendHead(200, 'OK')
			})
		}
	}
}

function special(req, rs, path) {
	localpath = path
	res = rs
	debug(req.body)
	switch(req.body.special) {

		case 'compile':
			debug('compiling')
			exec(`${localpath}main -a compile`, (error, stdout, stderr) => {
				debug(stdout + ' ' + stderr)
				if (error) {
					sendHead(400, `during converter run: ${stderr}`)
				} else {
					scp('index.html', 'out', () => {
						sendHead(200, '')
					})//send out compiled index
				}
			})
			break

		case 'download':
			exists(req.body.download, (result) =>  {
				if(result)
					res.sendFile(`${localpath}text/${req.body.download}.txt`)
				else 
					sendHead(404, `no post ${req.body.download} found`)
			})
			break

		default:
			sendHead(400, 'no parameter passed')
	}
}

function handle(file, body, done) {
	let match = file.mimetype.match(/text|image/)
	if(!match)
		return sendHead(400, `none or unsuccesful match against mimetype ${file.mimetype}`)
	let name = file.name.replace(' ', '-'),
		loc = `${match[0]}/${name}`// local path + name
	debug('handling '+name)
	store(file, loc, () => {
		if(match[0] === 'text')
			run('add', name, body, () => {
				done()
			})
		else
			scp(name, match[0], () => {
				done()
			})//send out file
	})

}

function run(action, name, body, done) {
	debug('exec')
	let cmd = `${localpath}main -a ${action} -f ${name}${body.music?` -m=${body.music}`:''}${body.musicurl?` -murl=${body.musicurl}`:''}`
	debug(cmd)
	if(!soft)
		exec(cmd, {cwd:cwd}, (error, stdout, stderr) => {
			if (error) {
				sendHead(400, `during converter run: ${stderr}`)
			}
			console.log(stdout + ' ' + stderr)
			scp('index.html', 'out', () => {
				done()
			})//send out compiled index
		})
	else
		done()
}

function store(file, loc, done) {//write incoming file
	if(soft)
		done()
	else
		file.mv(cwd+loc)
			.then(() => {
				debug('stored')
				done()
			}).catch((err) => {
				return sendHead(500, err.Error)
			})
}

function scp(name, type, done) {//copy file to tilde
	if(soft || dry)
		done()
	else
		exec(`scp ${localpath}${type}/${name} ${config.tilde.username}@tilde.town:/home/${config.tilde.username}/${config.tilde.path}${config.tilde.path.endsWith('/')?'':'/'}${type!=='out'?`zenbu/${type}/`:''}${name}`, (error, stdout, stderr) => {
			if (error) {
				sendHead(400, `during scp: ${error}`)
			}
			debug(error + ' ' + stdout + ' ' + stderr)
			done()
		})
}

function exists(name, done) {
	exec(`${localpath}main -a exists -f ${name}`, {cwd:cwd}, (error, stdout, stderr) => {
		debug(error + ' ' + stdout + ' ' + stderr)
		if (error)
			done(false)
		else
			done(true)
	})
}

function sendHead(code, string) {
	debug(string)
	if(res.headersSent)
		return
	res.status(code).send(string)
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

module.exports = {
	pages: [
		'upload',
		'special'
	],
	upload: upload,
	special: special
}
