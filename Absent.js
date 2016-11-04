var Remarkable = require('remarkable');
var fs = require('fs');
var pdf = require('html-pdf');

module.exports = Absent;

function Absent(infile,flags){
    
    if (infile == undefined){
        console.error("You need to give me an input file. For help type absent --help");
        process.exit(1); 
    }
    else {
        this.infile = infile;
        this.outfile = (infile.substr(0, infile.lastIndexOf('.')) || infile) + '.pdf';
        this.flags = flags;
        this.md = new Remarkable();
        this.process();
    }
}

Absent.prototype.process = function(){
    //setup markdown processor 
    this.customMarkdownAlterations();
    
    //get raw markdown
    try{
        var raw = fs.readFileSync(this.infile, 'utf8');
    } catch(err){
        if (err.code === 'ENOENT') {
              console.error('I cant find an input file named ' + this.infile);
              process.exit(1)
        } else {
            throw err;
        }
    }
    //create header 
    var header = this.createHeader(this.flags.css)

    //render markdown to html and stick header on top
    var html = header + '\n' + '<div class = "slide">' + this.md.render(raw)

    //build dom from html 
    var cheerio = require('cheerio'),$ = cheerio.load(html);

    /*extra dom processing rules go here*/ 
    //turn images into backgrounds
    $ = this.processImages($)
 
    //render dom back to html   
    html = $.html()



    if (this.flags.output === true){
        console.error("you need to give an output file if you use the --output flag. For help type absent --help");
        process.exit(1); 
    }
    if (this.flags.output != undefined){
        this.outfile = this.flags.output
    }
    if (this.flags.html == true){
        this.writeHtml(html,this.outfile)
    }
    this.writePdf(html,this.outfile)
}

Absent.prototype.customMarkdownAlterations =function(){

    //wrap slides in div after hr. last slide will be hanging div but browser can deal with that.
    
    var rules = this.md.renderer.rules
    var slideWrapper = function(tokens, idx, options /*, env */) {
          return (options.xhtmlOut ? '</div><div class="slide">':'</div><div class="slide">') +rules.getBreak(tokens, idx);
    }

    rules.hr = slideWrapper //replace hr rule with slide div wrapper
}

Absent.prototype.createHeader=function(cssflag){

    var template = '<link rel="stylesheet" type="text/css" href="file:///' + __dirname+ '/master.css"/>'    //load css from file 
    
    if (cssflag != undefined){ 
        template = template +'<link rel="stylesheet" type="text/css" href="file:///' + process.cwd() + '/' +cssflag+'" />'    //load css from file 

    } else { 
        template = template +'<link rel="stylesheet" type="text/css" href="file:///' + __dirname+ '/style.css"/>'    //load css from file 
    }
    return template 
}


Absent.prototype.processImages =function($){
    $('img').each(function(i,elem){
      $(elem).parent().parent().attr('style','background: url('+ process.cwd() +'/' + $(elem).attr('src') +');background-size: cover;');
      $(elem).remove() 
           
    })
    return $
}

Absent.prototype.writeHtml= function(html,outfile){   
    fs.writeFile(outfile +".html", html , function(err) {
            if(err) {
                        return console.log(err);
                            }

    });
} 


Absent.prototype.writePdf = function(html,outfile){   
    options = {
        'base': 'file:///' + process.cwd(),
        'width' : '720px',
        'height' : '540px'
    }
    pdf.create(html,options).toStream(function(err, stream){
          stream.pipe(fs.createWriteStream(outfile));
    });

}
