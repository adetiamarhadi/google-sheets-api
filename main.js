const express = require('express');
const app = express();

const parser = require('body-parser');
const jsonParser = parser.json();

const { google } = require('googleapis');
const keys = require('./keys.json');

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

app.listen(3456, () => {
    console.log('server running on port 3456');
});

app.get("/", (req, res) => {
    res.json({
        "status": "ok"
    });
});

app.post("/", jsonParser, (req, res) => {

    client.authorize(function (err, tokens) {

        let statusCode = 500;

        if (err) {
            console.error('err: ' + err.message);
        } else {
            append(client, req.body.data).then((sc) => {
                statusCode = sc;
            });
        }

        let message = statusCode == 201 ? 'created' : 'failed';

        res.status(statusCode);
        res.json({
            "status": message
        });

    });

});

async function append(cl, person) {

    let statusCode = 500;

    const gsapi = google.sheets({
        version: 'v4',
        auth: cl
    });

    const opt = {
        spreadsheetId: '',
        range: 'Data!A2',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: person
        }
    };

    try {
        let data = await gsapi.spreadsheets.values.append(opt);

        statusCode = data.status;
    } catch (e) {
        console.error("err: " + e.message);
    }

    return statusCode;
}