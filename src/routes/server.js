var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var PDFDocument = require('pdfkit');

var doc = new PDFDocument();
var connection = mysql.createConnection({
    host: 'localhost',
    user: '---',
    password: '---',
    database: 'nyble'
});

/*var user = {
    image: fs.readFileSync('./public/images/pPPYjUlUjf8.jpg'),
    firstName: 'Fog',
    lastName: 'Cat'
};*/
/*connection.query('INSERT INTO user SET ?', user, function (err,
    result) {
    console.log(result);
});*/
connection.connect();
router.route('/')
    .post(function (req, res) {
        var name = {
            firstName: req.body.firstName
        };
        console.log(name.firstName);
        connection.query('SELECT * FROM user WHERE firstName = ?', name.firstName, function (error, results, fields) {
            var answer;

            if (error) {
                throw error;
            }

            if (results.length >= 1) {
                console.log('user exists');
                var userId = results[0].id;
                var stream = doc.pipe(fs.createWriteStream('out.pdf'));

                doc.fontSize(14)
                    .text(results[0].firstName + ' ' + results[0].lastName, 100, 80);
                doc.image(new Buffer(results[0].image), {
                    fit: [250, 300],
                    align: 'center',
                    valign: 'center'
                });
                doc.save();
                doc.end();

                stream.on('finish', function () {
                    var pdfFile = {
                        pdf: fs.readFileSync('./out.pdf')
                    };
                    console.log(pdfFile.pdf);
                    connection.query('UPDATE user SET pdf = ? WHERE id = ?', [pdfFile.pdf, userId], function (error, results, fields) {
                        if (error) {
                            throw error;
                        }
                    });
                    answer = {
                        'status': true
                    };
                    res.json(answer);
                });
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
