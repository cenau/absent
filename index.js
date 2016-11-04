#!/usr/bin/env node
var Absent = require('./Absent.js')
const meow = require('meow');
const aliases = require('aliases');
const help = `
    Usage
      $ absent <input markdown file> 

    Options
      -o, --output Specify output pdf file name
      -t, --html Generate html as well; useful for messing with styles
      -c, --css supply your own css instead of default style.css. You monster.

    Examples
      $ absent awesome_presentation.txt
      This will generate awesome_presentation.pdf

      $ absent awesome_presentation.txt -o test.pdf -ht
      This will generate test.pdf and test.pdf.html

`;

const cli = meow(help, { alias: aliases(help, {h: 'help'}) });

var absent = new Absent(cli.input[0],cli.flags); 

