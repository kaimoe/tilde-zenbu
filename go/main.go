//the converter tool, turns the plaintext posts into formatted html
//and compiles them all to the full index

//usage: 	main add filename music(optional) musicurl(optional)
//				main compile
package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
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
	filename, out, postname = "", "", ""
	i, comm                 = 0, false
	t                       = time.Now()
	timestamp               = t.Format("2006-01-02-15-04")
)

func main() {
	if len(os.Args) < 2 {
		throw(0, "insufficient arguments")
	}
	switch os.Args[1] {
	case "add":
		if len(os.Args) < 3 {
			throw(0, "insufficient arguments for case add")
		}
		filename = strings.Replace(os.Args[2], ".txt", "", 1)
		postname = strings.Replace(filename, " ", "-", -1)
		fmt.Print(filename, postname)
		newPost()
	case "compile":
		compile()
	default:
		throw(0, "unrecognized argument: "+os.Args[1])
	}

} //end of main

func newPost() {
	file, err := os.Open("text/" + filename + ".txt")
	check(err)
	scanner := bufio.NewScanner(file)

	scanner.Scan()
	add("<h2>" + scanner.Text() + "</h2>") //add title
	scanner.Scan()

	for scanner.Scan() { //main scanner loop
		line := scanner.Text()
		i++
		//TODO: implement <ul>

		sp := re.FindStringSubmatch(line)
		switch {
		case line == "":
			add("</p>")
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

		add(line)
	} //end of file formatting

	check(scanner.Err())

	file.Close()
	write(out) //write formatted post to file
	log()      //add post to log
	compile()  //produce updated index.html
}

func add(line string) { //add line to output file
	out = out + line + "\n"
}

func addsp(line string, sp string) { //add special line to output file, handling first
	switch sp {
	case "h":
		line = "<h3>" + strings.TrimPrefix(line, "<h>") + "</h3>"
	case "add":
		line = `<p class="addendum">` + strings.TrimPrefix(line, "<add>")
	case "img":
		args := strings.Split(line, " ")[1:3]   //get imgname and position
		texts := strings.Split(line, " \"")[1:] //get alt and title texts

		line = `src="` + "img/" + args[0] + `" alt="` + texts[0] + ` title="` + texts[1] + ">"

		if args[1] == "center" {
			line = `<p><div class="c"><img ` + line + "</div>"
		} else if args[1] == "right" || args[1] == "left" {
			line = `<p class="f-clear"><img class="f-` + args[1] + ` fancy" ` + line
		} else {
			throw(i, "img align entry invalid")
		}
		comm = true
	}
	out = out + line + "\n"
}

func write(out string) { //create modified file
	time1 := t.Format("2006-01-02 15:04")
	time2 := t.Format("Jan 2 2006")

	if !strings.HasSuffix(out, "</p>") { //ensure last <p> closed
		out = out + "</p>"
	}
	out = "<div>\n<a name=\"" + postname + `" href="#` + postname + `"><time class="posttime" datetime="` + time1 + `">` + time2 + "</time></a>\n" + out + "\n"
	if len(os.Args) > 3 {
		listen := "<p class=\"listening\">"
		if len(os.Args) == 4 {
			listen = listen + os.Args[3]
		} else if len(os.Args) == 5 {
			listen = listen + "<a href=\"" + os.Args[4] + "\">" + os.Args[3] + "</a>"
		}
		out = out+ listen + "</p>"
	}

	out = out + "\n</div>\n\n"
	file, err := os.Create("posts/" + timestamp + ".txt") //create output file
	check(err)
	defer file.Close()

	_, err = file.WriteString(out) //write output file
	check(err)
}

func log() { //add new file to log
	file, err := os.OpenFile("log", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	check(err)
	defer file.Close()

	_, err = file.WriteString(postname + "," + timestamp + "\n")
	check(err)
}

func load() []byte { //load all posts from log in reverse-chronological order into one buffer
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
	master := load()

	text, err := ioutil.ReadFile("index1.html")
	check(err)
	master = append(text, master...)
	text, err = ioutil.ReadFile("index2.html")
	check(err)
	master = append(master, text...)

	file, err := os.Create("out/index.html")
	check(err)
	defer file.Close()

	_, err = file.Write(master)
	check(err)
}

func check(e error) { //for io errors
	if e != nil {
		throw(0, e.Error())
	}
}

func throw(i int, error string) { //i: line, error: custom string
	fmt.Fprintln(os.Stderr, "Line %d: %s", i, error)
	os.Exit(1)
}
