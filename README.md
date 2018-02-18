# tilde-zenbu
![a zenbu, colorized](https://i.imgur.com/leuisEX.png)

A JavaScript/Go project to help with formatting human-readable plaintext "blog posts" into custom html, for a tilde.town webpage

See it [here!](https://tilde.town/~sacredpixel)

## Components

* [js/src/main.js](https://github.com/TheSacredPixel/tilde-zenbu/blob/master/js/src/main.js) - Serves the webpage used to collect the post text file and images, saving, verifying, serving them to the Go converter, and uploading to tilde when done
* [go/main.go](https://github.com/TheSacredPixel/tilde-zenbu/blob/master/go/main.go) - Handles the post formatting, keeping a chronological log of all posts, naming appropriately, and compiling all into the HTML index

## Notes

* This can (currently) only run on a Linux machine, as it makes use of scp to send files to tilde.town

## To-Do

### General:
* Add sample config.json
* Make conversion/post templates more presentable and add to repo

### Converter:
* Add support for <ul> lists
* Do something to help with links (which are not currently handled in any way)
* Less- and greater-than symbols currently break, fix and add way to escape special characters
* Write capability for registering posts under different categories (to be done after appropriate CSS is written), or for different pages
* Maybe split posts under different pages after a certain number (based on the lightweight nature of the page, probably unnecessary)

### Interface:
* Write capability to manage log, edit/delete past entries, etc.

## Contributing

Feel free to make suggestions and open issues, PRs, or anything!

## Acknowledgments

Post HTML adapted from [Xkeeper's tilde.town page](https://tilde.town/~xkeeper/). Licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/us/)

## License

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
