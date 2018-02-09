# tilde-zenbu

A JavaScript/Go project to help with formatting human-readable plaintext "blog posts" into custom html, for a tilde.town webpage.

## Components

* **js/src/main.js** - Serves the webpage used to collect the post text file and images, saving, verifying, serving them to the Go converter, and uploading to tilde when done.
* **go/main.go** - Handles the post formatting, keeping a chronological log of all posts, naming appropriately, and compiling all into the HTML index.

## TO-DOs

* Write capability for registering posts under different categories (to be done after appropriate CSS is written).
* Maybe split posts under different pages after a certain number (based on the lightweight nature of the page, probably unnecessary).

## Contributing

Feel free to make suggestions and open issues, PRs, or anything!

## License

[CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/us/)

## Acknowledgments

* Post HTML adapted from [Xkeeper's tilde.town homepage](https://tilde.town/~xkeeper/). Licensed under [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/us/).
