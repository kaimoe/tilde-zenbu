## 1.1 - Mar 4 2018
### General
* The first release-build-ready version!
* Test directory can now be used to test changes in a non-breaking manner (accessed from dev options in the interface)
* Added config-sample.js, for user-friendly config settings
* Removed irrelevant file
* Slight code changes for better readability and future-proofing

### Interface
* Added ability to edit/update existing posts
* Added ability to download past posts
* Added index.js and offloaded some logic there
* Better handling of server requests/responses
* Improved testing options

### JS
* Changed main file to zenbu.js, for easier access and cleaner code
* Better request handling
* Added optional https functionality

### Go
* Actions, filename, and music/musicurl now called with flags
* Ability to run main as standalone, -h help
* --nolog flag to prevent logging new posts (for testing)
* Added functionality to check for file in log
* Fixed crash when trying to create file in non-existent path


## 1.0 - Feb 18 2018
* Actually tested and working build this time :^)
* Updated web interface with debugging options
* Added "Listening to" field
* Added sample config.json
* Squashed inconsistencies with file storage and http headers relating to JS asynchronicity
* Fixed compilation function and timestamp inconsistencies

## 0.1 - Feb 9 2018
* Initial commit, preliminary build
