var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;

var config = {
    user: 'ar-naseef',
    database: 'ar-naseef',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));

function makeTemplateForArticle (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    //template for single article 
    var htmlTemplate = `
    <html>
      <head>
          <title>
              ${title}
          </title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="/ui/style.css" rel="stylesheet" />
      </head> 
      <body>
          <div class="container">
              <div>
                  <a href="/">[Main Page]</a>
                  <a href="/articles">[Articles list]</a>
              </div>
              <hr/>
              <h2>
                  ${heading}
              </h2>
              <div>
                  ${date.toDateString()}
              </div>
              <div>
                ${content}
              </div>
          </div>
      </body>
    </html>
    `;
    return htmlTemplate;
}

// template for list all articles
function makeTemplate (data) {
    var headings = [];
    headings = data;
    var htmlTemplate = `
            <html>
                <head>
                    <title>Articles</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link href="/ui/style.css" rel="stylesheet" />
                    <style>
                        ul {
                            list-style-type: none;
                        }
                        li {
                            height: 100px;
                            border-radius: 30px;
                            background-color: #afb5bf;
                        }
                        
                        ul a {
                            font-size: 40px;
                            padding: auto;
                            text-decoration: none; 
                            color: #777777;
                        }
                        ul a:hover {
                            text-decoration: none; 
                            color: #555555;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div>
                            <a href="/">[Main Page]</a>
                        </div>
                        <hr/>
                        <h2>
                            Well come to my blog
                        </h2>
                        <div class='articlesList'>
                        <ul>
                        `;
                        
    for(var i=0; i<data.length; i++) {
        htmlTemplate = htmlTemplate + "<li><h2><a href=\"/articles/" + headings[i]['id'] + "\" >" + headings[i]['heading'] +"</a></h2></li>";
    }
    
    htmlTemplate =   htmlTemplate + `
                        </ul>
                        </div>
                    </div>
                </body>
            </html>
        `;
        
    return htmlTemplate;
}

//routes

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool = new Pool(config);

// code for rendering articles from DB
app.get('/articles/:articleID', function (req, res) {
  pool.query("select * from articles where id= $1", [req.params.articleID], function (err, result) {
    if (err) {
        res.status(500).send(err.toString());
    } else {
        if (result.rows.length === 0) {
            res.status(404).send('Boola... Article not found');
        } else {
            var articleData = result.rows[0];
            res.send(makeTemplateForArticle(articleData));
        }
    }
  });

    //res.send("you are here in articles");
});

// get the list of all available articles

app.get('/articles', function (req,res) {
    pool.query('select heading,id from articles', function (err, result){
        if (err) {
            res.status(500).send(err.toString());
        } else {
            if (result.rows.length === 0) {
                res.status(404).send('Boola... No articles in DB');
            } else {
                res.send(makeTemplate(result.rows));
            }
        }
    });
    
     //res.send("list of articles..");
});

app.get('/my_blog', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', 'my_blog.html'));
});

app.get('/ui/style.css', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

// app.get('/ui/madi.png', function (req, res) {
//     res.send('https://pbs.twimg.com/profile_images/791290598934196225/vZxbVNIr.jpg');
// });

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});