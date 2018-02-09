//work in progress, not yet implemented

const express = require ('express'),
	{ json } = require('body-parser'),
	request = require('request-promise-native'),
	config = require('./src/config.json'),
	app = express(),
	port = 8125
var obj = {trackok: false},
	track//, status, statustime
app.use(json())
//statustime = new Date()

app.get('/', function(req, res){
	res.status(401).end()
}).post('/', function(req, res){
	console.log(req.body)
	if(req.body.tilde) {//maybe add more authentication?
		//get last.fm
		request({
			uri: 'http://ws.audioscrobbler.com/2.0/',
			qs: {
				method: 'user.getrecenttracks',
				user: 'thesacredpixel',
				api_key: config.keys.lastfm,
				limit: 1,
				format: json
			},
			headers: {
				'User-Agent': 'Request-Promise-Native'
			},
			json: true,
			timeout: 10000
		}).catch((err) => { //eslint-disable-line
			//some form of logging?

		}).then((parsedBody) => {
			track = parsedBody.recenttracks.track[0]
			if(track['@attr'].nowplaying == 'true') {
				obj.trackok = true
				obj.track = track.name
				obj.artist = track.artist['#text']
			}
		})
		//get discord - NON-IMPLEMENTABLE for now, until user presence workaround is found
		//institute caching/throttling with statustime to prevent accidents

		res.status(200).json(obj)
		//obj = {trackok: bool, track: '', artist:'', statusok: bool, status: ''}
	}
})

app.listen(port)
console.log(`Server running at port ${port}`)
