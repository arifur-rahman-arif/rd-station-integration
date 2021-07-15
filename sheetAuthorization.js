const { google } = require("googleapis");

const googleClient = new google.auth.JWT(
    "sum-up-scraper@slack-sum-up-scraper.iam.gserviceaccount.com",
    null,
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDgM63wfqwXmGo7\nrI9I6VNuBHCJBOHNcVX37AxsGB4JYvb6ZazdO634CkU23D/bUnNxNn9Ui52+G5tl\ntrmuReb83FS8gcg746jtj+su/2IoEI56KfFp5tMAZgyO/fvl+AKf9BFlroJsZdED\nuGZAaQ9JlPkwIgwk7aMwQHFFv4ZWulaz/3uJZlb4zibYteJskI2npsLAqbejPSRZ\nI/Utjc+3yzvQKoEkgUNrXEZTS3u3eH/hjfiMbmhLi8VsndN9s0XY3qrxxfIDCCJ9\noSGFcehlS0lO934gu/UUhPLJ+LgL2R/sBpgI1bxDN6Kx+MU933zxUrya9TTu+YhC\nJgpzM1/HAgMBAAECggEAXqhDEE4S71VYyMAGsMReBo2WS6tFgF0Q7D77UanvCIyB\ndN93l+IqBZakeVCNH1aUyeA16yaVH139gnietX7q0qhdmEb9GJf6Su5f37RQJ1Uy\nKk7KD6m2PS1YsQh3kTTgOtMrgzAl/YkRMY5pkVkp7KmaeaFuWisAoo8ao9WEbNmt\n9F282pZ4sfbnyS7JI/BxcZHKnmSvC6eQzRFqpIC6DGJe568T7douV7JTGtyOqwQJ\nyaQq7efKG0/ZB29oUYolh9GL/r/7vXYoR/FcyqPXauVB5pac2hyfgHTQPhZ8l3LP\nL43sjD7EY8zDMS48E9BQhQey7ils7N1G8gOgJ9IBYQKBgQD4I7YCukvW1iiOg+bc\neF/AoYHOo0SuuiueewpiEy0nnq706eyrioLlvDBtPIRp3Q21S5ujJykj/JsYHCk0\nDf03OP55wZcsS4hUIv9cjA8gv2SKNkNGaRjMFiLHp1DcnvGzfwOj459cO4DNf/W1\nIY125ONGHneg0+D7xPWMxIZ/YQKBgQDnTdic+hhIM9wBDflmO7/8ph1wbIGbEkfe\ntZQWqKzvT2lcyzwj5KXDAma8DxQR3JzUDbXbV3gWm1p2QwpoIMXauINmeQUQafHb\n0JqJafpFzDn2H+SIUIq0tCkWBxd3vogASfkTf8E7xUrORnzKOrW2J2AZo3PLLkJ5\n7Ts0CVD4JwKBgClgSwlJZzv7meeptuUsbUsBo1OBhgJcqMlUWvbfm7fvjdzo5L31\n6r3EE48jeDDu20pPwTQDY6jMhlAO4g/8BS0gI87JqRuJvMHK1CnqcNtVDr69LZqg\nC7J8PnBsRd+D4Wm81C6P1hLbGS8rFx2M6rnYkM0wZ2I58loJDajbXFIBAoGACvHP\nBxZ6Yag6h74+h8zZ971wdSpdM5Y42lvjJvNSQ3yRcreXH+eoxEJv1AQuoe27aflA\nGqHX59HwBNqFOooaco/6f7XIPI+WxxzmwwvFsNnKAFBgAuc0uPoxW354aM0WKFVX\nuMl5vjdGo94H95WxlW3liTEHwJxuvtAv1fV+5E8CgYASpa+mWPfV5yozGplnTMG4\nG6m4CQctcY5mh0H2pm9p4DgWchy1UNv0G9YaJSPt1V2/F3PGl4PsIxiUe61nOyfM\nKoaqXThODTW+8g5zTyBiu+WReBHeoCVTLqnfRWLsMx5S9W1AZqwVlgnca4CEGgcA\nxrrDe6g3stPq9GgIxyZ4Pg==\n-----END PRIVATE KEY-----\n",
    ["https://www.googleapis.com/auth/spreadsheets"],
    null
);

const authorizeGoogleSheet = () => {
    return googleClient.authorize();
};

module.exports.google = google;
module.exports.googleClient = googleClient;
module.exports.authorizeGoogleSheet = authorizeGoogleSheet;
