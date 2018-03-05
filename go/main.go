//the converter tool, turns the plaintext posts into formatted html
//and compiles them all to the full index

//usage: 	main -a add -f filename -m music(optional) -murl musicurl(optional)
//				main -a update -f filename -m music(optional) -murl musicurl(optional)
//				main -a exists -f filename
//				main -a compile
//flags:	--nolog
package main

import (
	"bufio"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var (
	re   = regexp.MustCompile("<(h|add|img)>")
	tags = map[string]string{
		"b>":  "strong>",
		"i>":  "em>",
		"q>":  "blockquote>",
		"br>": "hr>",
	}
	actions               = []string{"add", "update", "exists", "compile"}
	action, filename, out = "", "", ""
	music, musicurl       = "", ""
	comm, nolog				    = false, false
	i                     = 0
	t                     = time.Now()
)

func main() {
	flag.StringVar(&action, "a", "", "action to execute out of: "+strings.Join(actions, ", "))
	flag.StringVar(&filename, "f", "", "filename to operate on")
	flag.StringVar(&music, "m", "", "text to be inputted in Now Listening field")
	flag.StringVar(&musicurl, "murl", "", "url to be applied in Now Listening field")
	flag.BoolVar(&nolog, "nolog", false, "don't add file to log")
	flag.Parse()

	switch action {
	case "add":
		if filename == "" {
			throw(0, "missing flag filename")
		}
		setFilename()
		formatPost()
		log()
		compile()
	case "update":
		if filename == "" {
			throw(0, "missing flag filename")
		}
		setFilename()
		updatePost()
		compile()
	case "exists":
		if fetchEntry(filename) == nil { //check for post in log
			throw(0, "could not locate entry "+filename)
		} else {
			fmt.Println("file exists")
		}
	case "compile":
		compile()
	default:
		fmt.Printf("Unrecognized -a value: %s\nValid values: %s\n", action, strings.Join(actions, " "))
		os.Exit(1)
	}
} //end of main

func formatPost() {
	file, err := os.Open("text/" + filename + ".txt")
	check(err)
	scanner := bufio.NewScanner(file)

	scanner.Scan()
	addLine("<h2>" + scanner.Text() + "</h2>") //add title
	scanner.Scan()

	for ; scanner.Scan(); i++ { //main scanner loop
		line := scanner.Text()

		sp := re.FindStringSubmatch(line)
		switch {
		case line == "":
			addLine("</p>")
			comm = false
			continue
		case sp != nil:
			addsp(line, sp[1])
			continue
		default:
			if !comm { //avoid opening new <p> if previous line was an img
				line = "<p>" + line
			}
		}

		for key, val := range tags { //convert special tags
			line = strings.Replace(line, "<"+key, "<"+val, -1)
			line = strings.Replace(line, "</"+key, "</"+val, -1)
		}

		addLine(line)
	} //end of file formatting

	check(scanner.Err())

	file.Close()
	write(out) //write formatted post to file
}

func updatePost() {
	entry := fetchEntry(filename)

	i, err := strconv.ParseInt(entry[1], 10, 64) //get post time
	check(err)
	t = time.Unix(i, 0)
	fmt.Printf("parsed time %s\n", t.String())

	if music == "" {
		music = entry[2]
		musicurl = entry[3]
	}

	formatPost()
}

func addLine(line string) { //add line to output file
	add(line + "\n")
}

func addsp(line string, sp string) { //add special line to output file, handling first
	switch sp {
	case "h":
		line = "<h3>" + strings.TrimPrefix(line, "<h> ") + "</h3>"
	case "add":
		line = `<p class="addendum">` + strings.TrimPrefix(line, "<add>")
	case "img":
		args := strings.Split(line, " ")[1:3]   //get imgname and position
		texts := strings.Split(line, " \"")[1:] //get alt and title texts
		title := ""

		if len(texts) == 1 {
			title = texts[0]
		} else {
			title = texts[1]
		}
		line = `src="` + "zenbu/image/" + args[0] + `" alt="` + texts[0] + ` title="` + title + ">"

		if args[1] == "center" {
			line = `<p><div class="c"><img ` + line + "</div>"
		} else if args[1] == "right" || args[1] == "left" {
			line = `<p class="f-clear"><img class="f-` + args[1] + ` fancy" ` + line
		} else {
			throw(i, "img align entry invalid. Proper syntax: <img> image.jpg \"alt text\"")
		}
		comm = true
	}
	add(line + "\n")
}

func write(out string) { //create modified file
	timestamp := strconv.FormatInt(t.Unix(), 10)
	time1 := t.Format("2006-01-02 15:04")
	time2 := t.Format("Jan 2 2006")

	if !strings.HasSuffix(out, "</p>\n") { //ensure last <p> closed
		out = out + "</p>"
	}
	out = "<div>\n<a name=\"" + filename + `" href="#` + filename + `" title="` + filename + `"><time class="posttime" datetime="` + time1 + `">` + time2 + "</time></a>\n" + out + "\n"

	if music != "" {
		listen := "<p class=\"listening\">"
		if musicurl == "" {
			listen = listen + music
		} else {
			listen = listen + "<a href=\"" + musicurl + "\">" + music + "</a>"
		}
		out = out + listen + "</p>"
	}

	out = out + "</div>\n\n"

	if _, err := os.Stat("./posts"); os.IsNotExist(err) {
		os.Mkdir("./posts", 0755)
	}
	file := create("posts", timestamp+".txt") //create output file
	defer file.Close()

	_, err := file.WriteString(out) //write output file
	check(err)
}

func log() { //add new file to log
	if nolog {
		return
	}
	file, err := os.OpenFile("log", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	check(err)
	defer file.Close()

	entry := []string{filename, strconv.FormatInt(t.Unix(), 10), music, musicurl}
	_, err = file.WriteString(strings.Join(entry, ",") + "\n")
	check(err)
}

func fetchEntry(filename string) []string { //find and return specified log entry
	file, err := os.Open("log")
	check(err)
	scanner := bufio.NewScanner(file)
	defer file.Close()

	for scanner.Scan() {
		x := strings.Split(scanner.Text(), ",")
		if x[0] == filename {
			return x
		}
	}
	check(scanner.Err())
	return nil
}

func loadAll() []byte { //load all posts from log in reverse-chronological order into one buffer
	file, err := os.Open("log")
	check(err)
	scanner := bufio.NewScanner(file)

	posts := []string{}

	for scanner.Scan() { //use log to make slice of filenames
		if scanner.Text() == "" {
			continue
		}
		line := strings.Split(scanner.Text(), ",")
		filename := line[1] + ".txt"
		posts = append([]string{filename}, posts...)
	}
	check(scanner.Err())
	file.Close()

	master := []byte{} //make master buffer

	for _, post := range posts { //add each file's contents
		text, err := ioutil.ReadFile("posts/" + post)
		check(err)
		master = append(master, text...)
	}
	return master
}

func compile() { //merge all posts and generate index
	master := loadAll()

	text, err := ioutil.ReadFile("index1.html")
	check(err)
	master = append(text, master...)
	text, err = ioutil.ReadFile("index2.html")
	check(err)
	master = append(master, text...)

	if _, err := os.Stat("./out"); os.IsNotExist(err) {
		os.Mkdir("./out", 0755)
	}
	file := create("out", "index.html")
	check(err)
	defer file.Close()

	_, err = file.Write(master)
	check(err)
}

func add(x string) { //add to output
	out = out + x
}

func check(e error) { //for io errors
	if e != nil {
		throw(0, e.Error())
	}
}

func create(folder string, file string) *os.File { //create and return file, checking for directory first
	if _, err := os.Stat("./" + folder); os.IsNotExist(err) {
		os.Mkdir("./"+folder, 0755)
	}
	x, err := os.Create(folder + "/" + file) //create output file
	check(err)

	return x
}

func setFilename() {
	filename = strings.Replace(filename, ".txt", "", 1)
	fmt.Println(filename)
}

func throw(i int, x string) { //i: line, error: custom string
	if i != 0 {
		fmt.Fprintf(os.Stderr, "Line %d: %s\n", i, x)
	} else {
		fmt.Fprintf(os.Stderr, x+"\n")
	}
	os.Exit(1)
}
