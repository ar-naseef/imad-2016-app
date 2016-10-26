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

// function makeTemplate (data) {
    
//     var htmlTemplate = `
//             <html>
//                 <head>
//                     <title>Articles</title>
//                     <meta name="viewport" content="width=device-width, initial-scale=1" />
//                     <link href="/ui/style.css" rel="stylesheet" />
//                 </head>
//                 <body>
//                     <div class="container">
//                         <div>
//                             <a href="/">[Main Page]</a>
//                         </div>
//                         <hr/>
//                         <h2>
//                             Well come to my blog
//                         </h2>
//                         <div class='articlesList'>
//                         <ul>
//                         `;
                        
//     for(var i=0; i<data.length; i++) {
//         htmlTemplate = htmlTemplate + "<li><h2>" + data[i] +"</h2></li>";
//     }
    
//     htmlTemplate =   htmlTemplate + `
//                         </ul>
//                         </div>
//                         <div>
//                             ${content}
//                         </div>
//                     </div>
//                 </body>
//             </html>
//         `;
        
//     return htmlTemplate;
// }

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
    pool.query("SELECT heading FROM articles", function (err, result){
        // if (err) {
        //     res.status(500).send(err.toString());
        // } else {
        //     if (results.rows.length === 0) {
        //         res.send("<h3 alighn='center'>No articles in the DB</h3>");
        //     } else {
        //         // res.send(makeTemplateForArticleList(result.rows));
        //         res.send("list here");
        //     }
        // }
        console.log(err);
        console.log(result);
    });
    
     res.send("list of articles..");
});








app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});