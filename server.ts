import clientsJson from './config/clients.json';
import companyJson from './config/company.json';
import commandLineArgs from 'command-line-args'
import htmlToPdf from 'html-pdf-node'
import { htmlPage } from "./config/invoice";
import {google, GoogleApis} from "googleapis";
import dotenv from 'dotenv';
import * as files from "fs";
const fs = require('fs').promises;
import {authenticate} from "@google-cloud/local-auth";
import path from "path";

dotenv.config()

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

export interface Client {
    id: string,
    name: string,
    address: string,
    country: string,
    email: string,
    phone: string,
}

export interface Company {
    name: string
    owner: string
    taxNumber: string
    idNumber: string
    address: string
    phone: string
    bankAccount: string,
    bankName: string
    additionalInfo: string
}

const optionDefinitions = [
    { name: 'client', alias: 'c', type: String },
    { name: 'amount', alias: 'a', type: Number },
    { name: 'date', alias: 'd', type: String },
    { name: 'currency', alias: 'm', type: String },
    { name: 'invoiceNumber', alias: 'i', type: Number },
]
const options = commandLineArgs(optionDefinitions)

if (!options.client || !options.amount || !options.date || !options.currency || !options.invoiceNumber) {
    throw new Error("Wrong command parameters provided, format should be: create-invoice --client=XX --amount=XX --date=XX --currency=XX invoiceNumber=XX")
}

if (typeof options.amount !== 'number' || typeof options.invoiceNumber !== 'number') {
    throw new Error("--amount and --invoiceNumber should be numbers not text!")
}

const clients: Array<Client> = JSON.parse(JSON.stringify(clientsJson))
const company: Company = JSON.parse(JSON.stringify(companyJson))

const client = clients.find((client) => client.id === options.client)

if (!client) {
    throw new Error("Client not found!")
}

const saveCredentials = async (client: any) => {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

const loadSavedCredentialsIfExist = async (): Promise<any> => {
    try {
        const content = await fs.readFile(TOKEN_PATH, "");
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

const authorize = async (): Promise<any> => {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

const createAndUploadPdf = async () => {
    const pdfName = `${options.invoiceNumber}_${options.date}_${client.name}_${options.currency}.pdf`
    const pdfOptions = { format: 'A4', path: `./pdfs/${pdfName}`, preferCSSPageSize: true};
    const file = { content: htmlPage(client, company, options.date, options.amount, options.currency, options.invoiceNumber) };
    await htmlToPdf.generatePdf(file, pdfOptions)

    await fs.readFile(CREDENTIALS_PATH)

    const gClient = await authorize()
    const drive = google.drive({version: 'v3', auth: gClient});
    const requestBody = {
        name: pdfName,
        fields: 'id',
        parents: [`${process.env.GOOGLE_DRIVE_FOLDER}`]
    };
    const media = {
        mimeType: 'application/pdf',
        body: files.createReadStream(`pdfs/${pdfName}`),
    };
    try {
        await drive.files.create({
            requestBody,
            media: media,
        });
    } catch (err) {
        throw err;
    }

}

createAndUploadPdf().then(() => {
    return "Invoice pdf is created and uploaded to the Google Drive!"
})










