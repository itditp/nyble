var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
/*var nodeJspdf = require('node-jspdf');
var Base64 = require('js-base64').Base64;*/
var PDFDocument = require('pdfkit');

/*var doc = nodeJspdf();*/
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '198989',
    database: 'nyble'
});
/*var user = {
    image: fs.readFileSync('/home/misha/Desktop/Wallpapers/04-620x432.jpg'),
    firstName: 'Dog',
    lastName: 'Cat'
};*/

connection.connect();
/*connection.query('INSERT INTO user SET ?', user, function(err,
    result) {
    console.log(result);
});*/
router.route('/')
    .post(function (req, res) {
        var name = {
            firstName: req.body.firstName
        };
        console.log(name);
        connection.query('SELECT * FROM user WHERE firstName = ?', name.firstName, function (error, results, fields) {
            var answer = {};

            if (error) {
                throw error;
            }

            if (results.length >= 1) {
                console.log('user exists');
                var doc = new PDFDocument();
                doc.pipe(fs.createWriteStream('out.pdf'));
                doc.fontSize(14)
                    .text(results[0].firstName + ' ' + results[0].lastName, 100, 80);
                doc.image(new Buffer(results[0].image), {
                    fit: [250, 300],
                    align: 'center',
                    valign: 'center'
                });
                doc.save();
                doc.end();

                answer = {
                    'status': true
                };
                res.json(answer);
            }

            if (results.length === 0) {
                console.log('user does not exist');
                answer = {
                    'status': false
                };
                res.json(answer);
            }
        });
    });

module.exports = router;
