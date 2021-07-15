const express = require("express");
const app = express();
const fs = require("fs");
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
    // console.log(JSON.stringify(req.body, null, 4));
    let requiredData = organizeData(req.body);
    sendDataToSheet(requiredData);
    res.status(200).end();
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

    // Get the sheet object
    const sheets = google.sheets({ version: "v4", auth: googleClient });

    rquiredData.forEach((data) => {
        const sheetInsertOptions = {
            spreadsheetId: "1Gu8Lseeekr33yoLGuu6qfh-mAQxgg487sPSkx4io5Qo",
            range: "AS IN SCRIPT!A2:T",
            valueInputOption: "USER_ENTERED",
            responseValueRenderOption: "FORMATTED_VALUE",
            resource: {
                values: [insertionValuesForSheet(data)],
                majorDimension: "ROWS",
            },
        };

        sheets.spreadsheets.values.append(sheetInsertOptions).then((res, err) => {
            if (err) return console.trace(err);

            if (res.status == 200) {
                console.trace("data inserted in sheet");
            }
        });
    });
};

const insertionValuesForSheet = (data) => {
    insertionValues = [
        data.createdAt,
        data.email,
        data.name,
        data.opportunity,
        data.firstConversionDate,
        data.firstConversionIdentificator,
        data.firstConversionSource,
        data.firstConversionMedium,
        data.firstConversionCampaign,
        data.firstConversionChannel,
        data.lastConversionDate,
        data.lastConversionIdentificator,
        data.lastConversionSource,
        data.lastConversionMedium,
        data.lastConversionCampaign,
        data.lastConversionChannel,
        data.leadStage,
        data.lastMarkedOpportunityDate,
        data.fitScore,
        data.interest,
    ];

    return insertionValues;
};

// lt -p 3000 -s rdstationapitesting123
