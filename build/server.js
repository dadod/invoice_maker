"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clients_json_1 = __importDefault(require("./config/clients.json"));
const company_json_1 = __importDefault(require("./config/company.json"));
const command_line_args_1 = __importDefault(require("command-line-args"));
const html_pdf_node_1 = __importDefault(require("html-pdf-node"));
const invoice_1 = require("./config/invoice");
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const files = __importStar(require("fs"));
const fs = require('fs').promises;
const local_auth_1 = require("@google-cloud/local-auth");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const CREDENTIALS_PATH = path_1.default.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path_1.default.join(process.cwd(), 'token.json');
const optionDefinitions = [
    { name: 'client', alias: 'c', type: String },
    { name: 'amount', alias: 'a', type: Number },
    { name: 'date', alias: 'd', type: String },
    { name: 'currency', alias: 'm', type: String },
    { name: 'invoiceNumber', alias: 'i', type: Number },
];
const options = (0, command_line_args_1.default)(optionDefinitions);
if (!options.client || !options.amount || !options.date || !options.currency || !options.invoiceNumber) {
    throw new Error("Wrong command parameters provided, format should be: create-invoice --client=XX --amount=XX --date=XX --currency=XX invoiceNumber=XX");
}
if (typeof options.amount !== 'number' || typeof options.invoiceNumber !== 'number') {
    throw new Error("--amount and --invoiceNumber should be numbers not text!");
}
const clients = JSON.parse(JSON.stringify(clients_json_1.default));
const company = JSON.parse(JSON.stringify(company_json_1.default));
const client = clients.find((client) => client.id === options.client);
if (!client) {
    throw new Error("Client not found!");
}
const saveCredentials = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    yield fs.writeFile(TOKEN_PATH, payload);
});
const loadSavedCredentialsIfExist = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content = yield fs.readFile(TOKEN_PATH, "");
        const credentials = JSON.parse(content);
        return googleapis_1.google.auth.fromJSON(credentials);
    }
    catch (err) {
        return null;
    }
});
const authorize = () => __awaiter(void 0, void 0, void 0, function* () {
    let client = yield loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = yield (0, local_auth_1.authenticate)({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        yield saveCredentials(client);
    }
    return client;
});
const createAndUploadPdf = () => __awaiter(void 0, void 0, void 0, function* () {
    const pdfName = `${options.invoiceNumber}_${options.date}_${client.name}_${options.currency}.pdf`;
    const pdfOptions = { format: 'A4', path: `./pdfs/${pdfName}`, preferCSSPageSize: true };
    const file = { content: (0, invoice_1.htmlPage)(client, company, options.date, options.amount, options.currency, options.invoiceNumber) };
    yield html_pdf_node_1.default.generatePdf(file, pdfOptions);
    yield fs.readFile(CREDENTIALS_PATH);
    const gClient = yield authorize();
    const drive = googleapis_1.google.drive({ version: 'v3', auth: gClient });
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
        yield drive.files.create({
            requestBody,
            media: media,
        });
    }
    catch (err) {
        throw err;
    }
    files.rmSync(path_1.default.join(process.cwd(), `pdfs/${pdfName}`));
});
createAndUploadPdf().then(() => {
    return "Invoice pdf is created and uploaded to the Google Drive!";
});
