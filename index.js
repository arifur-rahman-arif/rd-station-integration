const express = require("express");
const fs = require("fs");
const app = express();
const { google } = require("googleapis");
const { authorizeGoogleSheet, googleClient } = require("./sheetAuthorization");

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

app.use(express.urlencoded({ extended: true }));

const customParser = express.json({
    type: function (req) {
        if (req.headers["content-type"] === "") {
            return (req.headers["content-type"] = "application/json");
        } else if (typeof req.headers["content-type"] === "undefined") {
            return (req.headers["content-type"] = "application/json");
        } else {
            return (req.headers["content-type"] = "application/json");
        }
    },
});

app.post("/rd-station", customParser, (req, res) => {
    let requiredData = organizeData(req.body);
    sendDataToSheet(requiredData);
    res.status(200).end();
});

app.post("/bulk-integration", customParser, (req, res) => {
    let requiredData = organizeData(req.body);
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    try {
        fs.writeFile(
            `lead/data_${timestamp}.json`,
            JSON.stringify(requiredData[0]),
            function (error, response) {
                if (error) {
                    return console.trace(error);
                }
                console.trace("data stored successfully");
            }
        );
    } catch (error) {
        console.trace(error);
    }
    res.status(200).end();
});

app.get("/bulk-data-form", customParser, (req, res) => {
    let totalLead = bulkInsertionDataArray().length;
    res.status(200).send(formLayout(totalLead)).end();
});

app.post("/insert-bulk-data", customParser, (req, res) => {
    sendBulkDataToSheet(res);
});

const organizeData = (rdStationData) => {
    let orgnizedData = [];

    if (!rdStationData.leads) return console.trace(`Data is empty at ${rdStationData}`);

    rdStationData.leads.forEach((data) => {
        orgnizedData.push({
            createdAt: data.created_at,
            email: data.email,
            name: data.name,
            opportunity: data.opportunity,
            firstConversionDate: data.first_conversion.content.created_at,
            firstConversionIdentificator: data.first_conversion.content.identificador,
            firstConversionSource: data.first_conversion.conversion_origin.source,
            firstConversionMedium: data.first_conversion.conversion_origin.medium,
            firstConversionCampaign: data.first_conversion.conversion_origin.campaign,
            firstConversionChannel: data.first_conversion.conversion_origin.channel,
            lastConversionDate: data.last_conversion.content.created_at,
            lastConversionIdentificator: data.last_conversion.content.identificador,
            lastConversionSource: data.last_conversion.conversion_origin.source,
            lastConversionMedium: data.last_conversion.conversion_origin.medium,
            lastConversionChannel: data.last_conversion.conversion_origin.channel,
            lastConversionCampaign: data.last_conversion.conversion_origin.campaign,
            leadStage: data.lead_stage,
            lastMarkedOpportunityDate:
                data.last_marked_opportunity_date == null
                    ? "null"
                    : data.last_marked_opportunity_date,
            fitScore: data.fit_score,
            interest: data.interest,
        });
    });

    return orgnizedData;
};

const sendDataToSheet = async (rquiredData) => {
    let isSheetValidated = await authorizeGoogleSheet();

    if (!isSheetValidated.access_token) {
        console.trace("Google sheet could not be validated");
    }

    if (!rquiredData) return console.trace(`No data found at ${rquiredData}`);

    rquiredData.forEach((data) => {
        insertDataIntoSheet(data);
    });
};

const insertDataIntoSheet = async (data) => {
    const sheets = google.sheets({ version: "v4", auth: googleClient });
    const sheetInsertOptions = {
        spreadsheetId: "1Gu8Lseeekr33yoLGuu6qfh-mAQxgg487sPSkx4io5Qo",
        range: "AS IN SCRIPT!A2:T",
        valueInputOption: "USER_ENTERED",
        responseValueRenderOption: "FORMATTED_VALUE",
        insertDataOption: "INSERT_ROWS",
        resource: {
            values: [insertionValuesForSheet(data)],
            majorDimension: "ROWS",
        },
    };

    try {
        const sheetResponse = await sheets.spreadsheets.values.append(sheetInsertOptions);
        if (sheetResponse.status == 200) {
            console.trace("data inserted in sheet");
        }
    } catch (err) {
        console.trace(err);
    }
};

const insertionValuesForSheet = (data) => {
    insertionValues = [
        `${data.createdAt}`,
        `${data.email}`,
        `${data.name}`,
        `${data.opportunity}`,
        `${data.firstConversionDate}`,
        `${data.firstConversionIdentificator}`,
        `${data.firstConversionSource}`,
        `${data.firstConversionMedium}`,
        `${data.firstConversionCampaign}`,
        `${data.firstConversionChannel}`,
        `${data.lastConversionDate}`,
        `${data.lastConversionIdentificator}`,
        `${data.lastConversionSource}`,
        `${data.lastConversionMedium}`,
        `${data.lastConversionCampaign}`,
        `${data.lastConversionChannel}`,
        `${data.leadStage}`,
        `${data.lastMarkedOpportunityDate}`,
        `${data.fitScore}`,
        `${data.interest}`,
    ];

    return insertionValues;
};

const formLayout = (totalData) => {
    let form = `
        <style>
            button {
                position: absolute;
                top: 10%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 20px;
                padding: 10px 20px;
                outline: none;
                border: none;
                background: #26fb26;
                border-radius: 10px;
                text-transform: uppercase;
                cursor: pointer;
            }
        </style>
        <form action="./insert-bulk-data" method="POST">
            <button type="submit" class="btn btn-primary">Insert Data (${totalData})</button>
        </form>
    `;

    return form;
};

const sendBulkDataToSheet = async (res) => {
    let isSheetValidated = await authorizeGoogleSheet();

    if (!isSheetValidated.access_token) {
        console.trace("Google sheet could not be validated");
    }

    let insertData = bulkInsertionDataArray();

    const sheets = google.sheets({ version: "v4", auth: googleClient });
    const sheetInsertOptions = {
        spreadsheetId: "1P8IO9GiBqyrjfP_CMGHYE_sQiOAMk-3uEbPj5OtuVV4",
        range: "RD Station!A2:T",
        valueInputOption: "USER_ENTERED",
        responseValueRenderOption: "FORMATTED_VALUE",
        insertDataOption: "INSERT_ROWS",
        resource: {
            values: insertData,
            majorDimension: "ROWS",
        },
    };

    try {
        const sheetResponse = await sheets.spreadsheets.values.append(sheetInsertOptions);
        if (sheetResponse.status == 200) {
            console.trace("data inserted in sheet");
            emptyLeadData();
            res.status(200).send("<i><h3>Data inserted into google sheet</h3></i>").end();
        } else {
            res.status(200).send("<i><h3>Data Insertion Failed</h3></i>").end();
        }
    } catch (err) {
        console.trace(err);
    }
};

const bulkInsertionDataArray = () => {
    try {
        let formattedArray = [];

        let allFiles = fs.readdirSync("./lead");

        if (!allFiles) return console.trace("no file found");

        allFiles.forEach((file) => {
            let data = fs.readFileSync(`lead/${file}`, "utf8");

            if (data) {
                let savedData = JSON.parse(data);
                formattedArray.push(insertionValuesForSheet(savedData));
            }
        });

        return formattedArray;
    } catch (error) {
        console.trace(error);
    }
};

const emptyLeadData = () => {
    fs.readdir("./lead", (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(`./lead/${file}`, (err) => {
                if (err) throw err;
            });
        }
    });
};

// lt -p 3000 -s rdstationapitesting12345

// let allFiles = fs.readdirSync("./lead");

// console.log(allFiles);
