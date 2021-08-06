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

app.post("/single-integration", customParser, (req, res) => {
    let requiredData = organizeData(req.body);
    console.log(requiredData);
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

app.get("/", customParser, (req, res) => {
    let totalLead = bulkInsertionDataArray().length;
    res.status(200).send(formLayout(totalLead)).end();
});

app.post("/insert-bulk-data", customParser, (req, res) => {
    sendBulkDataToSheet(res);
});

const organizeData = (rdStationData) => {
    let orgnizedData = [];

    if (!rdStationData.leads) return console.trace(`Data is empty at ${rdStationData}`);

    rdStationData.leads.forEach((lead) => {
        orgnizedData.push({
            Email: lead.email,
            "Estágio no funil": lead.lead_stage,
            "Data da última oportunidade": lead.last_marked_opportunity_date
                ? formatDate(lead.last_marked_opportunity_date)
                :,
            "Data da última venda": lead.last_sale_date ? formatDate(lead.last_sale_date) : ,
            "Valor da última venda": lead.last_sale_value_date
                ? formatDate(lead.last_sale_value_date)
                : ,
            "Lead Scoring - Perfil": lead.fit_score || ,
            "Lead Scoring - Interesse": lead.interest || ,
            "Data da primeira conversão": lead.first_conversion.created_at
                ? formatDate(lead.first_conversion.created_at)
                : ,
            "Identificador da primeira conversão":
                lead.first_conversion.content.identificador || ,
            "Fonte da primeira conversão": lead.first_conversion.conversion_origin.source || ,
            "Meio da primeira conversão": lead.first_conversion.conversion_origin.medium || ,
            "Campanha da primeira conversão":
                lead.first_conversion.conversion_origin.campaign || ,
            "Canal da primeira conversão": lead.first_conversion.conversion_origin.channel || ,
            "Data da última conversão": lead.last_conversion.created_at
                ? formatDate(lead.last_conversion.created_at)
                : ,
            "Identificador da última conversão":
                lead.last_conversion.conversion_origin.source || ,
            "Fonte da última conversão": lead.last_conversion.conversion_origin.source || ,
            "Meio da última conversão": lead.last_conversion.conversion_origin.medium || ,
            "Campanha da última conversão": lead.last_conversion.conversion_origin.campaign || ,
            "Canal da última conversão": lead.last_conversion.conversion_origin.channel || ,
            "Etapa do funil de vendas no CRM (última atualização)":
                lead.custom_fields["[CRM] Etapa do funil de vendas no CRM (última atualização)"] ||
                ,
            "Funil de vendas no CRM (última atualização)":
                lead.custom_fields["Funil de vendas no CRM (última atualização)"] || ,
            "Motivo de Perda no RD Station CRM": ,
            "Nome do responsável pela Oportunidade no CRM (última atualização)":
                lead.custom_fields[
                    "[CRM] Nome do responsável pela Oportunidade no CRM (última atualização)"
                ] || ,
            Origem: lead.last_conversion.conversion_origin.channel || ,
            "Origem da Oportunidade no CRM (última atualização)":
                lead.custom_fields["[CRM] Origem da Oportunidade no CRM (última atualização)"] ||
                ,
            "Qualificação da Oportunidade no CRM (última atualização)":
                lead.custom_fields[
                    "[CRM] Qualificação da Oportunidade no CRM (última atualização)"
                ] || ,
            "Valor total da Oportunidade no CRM (última atualização)":
                lead.custom_fields[
                    "[CRM] Valor total da Oportunidade no CRM (última atualização)"
                ] || ,
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
        range: "Marketing!A2:A",
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
        `${data["Email"]}`, // Column A
        `${data["Estágio no funil"]}`, // Column B
        `${data["Data da última oportunidade"]}`, // Column C
        `${data["Data da última venda"]}`, // Column D
        `${data["Valor da última venda"]}`, // Column E
        `${data["Lead Scoring - Perfil"]}`, // Column F
        `${data["Lead Scoring - Interesse"]}`, // Column G
        `${data["Data da primeira conversão"]}`, // Column H
        `${data["Identificador da primeira conversão"]}`, // Column I
        `${data["Fonte da primeira conversão"]}`, // Column J
        `${data["Meio da primeira conversão"]}`, // Column K
        `${data["Campanha da primeira conversão"]}`, // Column L
        `${data["Canal da primeira conversão"]}`, // Column M
        `${data["Data da última conversão"]}`, // Column N
        `${data["Identificador da última conversão"]}`, // Column O
        `${data["Fonte da última conversão"]}`, // Column p
        `${data["Meio da última conversão"]}`, // Column Q
        `${data["Campanha da última conversão"]}`, // Column R
        `${data["Canal da última conversão"]}`, // Column S
        `${data["Etapa do funil de vendas no CRM (última atualização)"]}`, // Column T
        `${data["Funil de vendas no CRM (última atualização)"]}`, // Column U
        `${data["Motivo de Perda no RD Station CRM"]}`, // Column V
        `${data["Nome do responsável pela Oportunidade no CRM (última atualização)"]}`, // Column W
        `${data["Origem"]}`, // Column X
        `${data["Origem da Oportunidade no CRM (última atualização)"]}`, // Column Y
        `${data["Qualificação da Oportunidade no CRM (última atualização)"]}`, // Column Z
        `${data["Valor total da Oportunidade no CRM (última atualização)"]}`, // Column AA
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
        spreadsheetId: "1Gu8Lseeekr33yoLGuu6qfh-mAQxgg487sPSkx4io5Qo",
        range: "Marketing!A2:T",
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
    let formattedArray = [];

    let allFiles = fs.readdirSync("./lead");

    if (!allFiles) return console.trace("no file found");

    allFiles.forEach((file, index) => {
        if (fs.existsSync(`lead/${file}`)) {
            let data = fs.readFileSync(`lead/${file}`, "utf-8");
            if (data) {
                if (isValidJSONString(data)) {
                    let savedData = JSON.parse(data);
                    formattedArray.push(insertionValuesForSheet(savedData));
                }
            }
        }
    });

    return formattedArray;
};

const isValidJSONString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
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

const monthName = () => {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
};

// const formatAMPM = (date) => {
//     var hours = date.getHours();
//     var minutes = date.getMinutes();
//     var ampm = hours >= 12 ? "pm" : "am";
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
//     minutes = minutes < 10 ? "0" + minutes : minutes;
//     var strTime = hours + ":" + minutes + " " + ampm;
//     return strTime;
// };

const formatDate = (timestamp) => {
    let dateObj = new Date(timestamp);
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, 0);
    let day = dateObj.getDate().toString().padStart(2, 0);
    let hours = dateObj.getHours().toString().padStart(2, 0);
    let min = dateObj.getMinutes().toString().padStart(2, 0);
    let seconds = dateObj.getSeconds();

    return `${day}/${month}/${year} ${hours}:${min}`;
};
