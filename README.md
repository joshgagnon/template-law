# template-law
Microservice for generating PDFs of legal documents.

npm install



run with node index.js

compile for production with
NODE_ENV=production webpack



Requires phantomjs, postgres and calibri fonts



CREATE TABLE saved_data (
    title TEXT PRIMARY KEY,
    data json,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)



TODO
   force matterID,


   File names -  ${name without code} - ${matterId} - ${DD MMM YYYY}.ext