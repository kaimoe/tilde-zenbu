module.exports = {

	tilde: {

		// Your username in town, sans the ~
		username: 'username',

		/*
				The location within your user direcory where the index and zenbu files will be stored.
				Change this if you want to have everything under a different page than the default.
				It should start with public_html/

				***Setting it to 'public_html/' means the index.html file currently served as your page WILL BE OVERWRITTEN***

				eg: 'public_html/blog/' will appear online under tilde.town/~username/blog
		*/
		path: 'public_html/zenbu/'
	},

	/*
			The port you want the server to run on.
			If you plan on leaving it running, it is highly suggested you set it
			to some high arbitrary value.
	*/
	port: 8080,


	/*
			There is (optional) capability to use encryption for the web interface.
			This will let you use your own certificate and force all connections to use https.

			This requires your private key and fullchain files in .pem format, with the names
			privkey.pem and fullchain.pem respectively.

			If you don't know what any of that means, leave this section as-is.
	*/
	ssl: {

		/*
				Change to true to use https.
				You will need to have your own ssl certificate files in .pem format.
		*/
		enabled: false,

		/*
				By default, zenbu will look for the certificate files in the same directory as this file.
				If you want to store them somewhere else, add the global path here.

				Make sure that the path + files can be accessed by the user that runs zenbu.
		*/
		path: ''
	},

	// You really shouldn't touch any of this stuff
	ver: 1.1
}
