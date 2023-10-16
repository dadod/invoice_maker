# Invoice maker

Create and upload invoices to the Google Drive. 

## Prerequisites
- [Create project on GCP and enable Google Drive API](https://developers.google.com/drive/api/quickstart/nodejs#enable_the_api) 
- Add credentials JSON file to the root folder of the project
- Setup clients and company json to match your data:
```json
// clients.json
[
  {
    "id": "gg-123",
    "name": "Google",
    "address": "3, Bentinck House, 8 Bolsover St, London W1W 6AB, UK",
    "phone": "+44 800 060 8704"
  },
  {
    "id": "fb-123",
    "name": "Apple",
    "address": "10500 N De Anza Blvd, Cupertino, CA 95014, US",
    "phone": "+14089961010"
  }
]

// company.json
{
  "name": "Test Company",
  "owner": "Owner",
  "taxNumber": "1234567890",
  "idNumber": "1234567890",
  "address": "Company address",
  "phone": "+3870666123456",
  "bankAccount": "387123456789",
  "bankName": "Test bank",
  "additionalInfo": "Additional info"
}
```
- Add .env file
```dotenv
GOOGLE_DRIVE_FOLDER=<FOLDER_ID>
```

## Run project
```console
yarn install
yarn build
yarn create-invoice --client=gg-123 --amount=100.00 --date=16.10.2023 --currency=EUR --invoiceNumber=13
```
