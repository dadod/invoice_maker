"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlPage = void 0;
const htmlPage = (client, company, date, amount, currency, invoiceNumber) => {
    return `
<meta charset="UTF-8">
<html>
    <head>
        <style>
            @page {
                size: 21cm 29.7cm;
                margin: 30mm 45mm 30mm 45mm;
            }   
            body {
                font: normal 12px Verdana, Arial, sans-serif;
                margin: 60px;
            }
            hr.solid {
                border-top: 2px solid #000;
            }
             hr.solid-medium {
                border-top: 1px solid #000;
                width: 30%;
            }
            .column {
                float: left;
                width: 50%;
            }
            .row:after {
                content: "";
                display: table;
                clear: both;
            }
            .align-center {
                text-align: center;
            }
            .align-end {
                text-align: end;
                vertical-align: top;
            }
            .align-top {
                vertical-align: top;
            }
            table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
            }
            td {
                padding: 10px;
            }
            th {
                padding: 10px;
            }
            .no-border {
                border: none !important;
            }
            .full-width {
                width: 100%;
            }
            .container {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }
    
            main {
              flex: 1;
            }
            footer {
                margin-left: 60px;
                margin-right: 60px;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 100px;
                background:#ccc;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <p>
                   <b>${company.name}</b>
                </p>
                <p>
                   <b>${company.address}</b>
                </p>
                <hr class="solid">
            </header>
            <main>
                <table class="full-width no-border">
                    <tr>
                        <td class="no-border">
                            <p>${client.name}</p>
                            <p>${client.address}</p>
                            <p>${client.country}</p>
                            <p>${client.email}</p>
                            <p>${client.phone}</p>
                        </td>
                        <td class="align-end align-top no-border">
                            ${date}
                        </td>
                    </tr>
                </table>
            
                <br/>
                <br/>
                <h1 class="align-center">FAKTURA ${invoiceNumber}/2023</h1>
        
                <br/>
                <br/>
                
                <table class="full-width">
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>OPIS</th>
                            <th>IZNOS</th>
                            <th>PDV</th>
                            <th>CIJENA</th>
                            <th>KOLIČINA</th>
                            <th>SUMA</th>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Konzultanske usluge po ugovoru</td>
                            <td class="align-end">${amount}</td>
                            <td class="align-end">0</td>
                            <td class="align-end">00.00</td>
                            <td class="align-end">1.00</td>
                            <td class="align-end">${amount}</td>
                        </tr>
                        <tr>
                            <td colspan="6">Ukupno (BEZ PDV-a)</td>
                            <td class="align-end">${amount}</td>
                        </tr>
                        <tr>
                            <td colspan="6">Ukupno (PDV)</td>
                            <td class="align-end">00.00</td>
                        </tr>
                        <tr>
                            <td colspan="6"><b>Ukupno za platiti (${currency})</b></td>
                            <td class="align-end"><b>${amount}</b></td>
                        </tr>
                    </tbody>
                </table>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <table class="no-border">
                <tr>
                    <td class="no-border" colspan="2">
                        <hr class="solid">
                    </td>
                    <td class="no-border"></td>
                </tr>
                <tr>
                    <td class="no-border" colspan="2">
                        <p class="align-center">${company.owner}</p>
                    </td>
                    <td class="no-border"></td>
                </tr>
                </table>  
            </main>
        <footer>
            <hr class="solid">
            <p>Tel/Fax: <b>${company.phone}</b>; ID BROJ: <b>${company.idNumber}</b>; PDV broj: <b>${company.taxNumber}</b>; Transakcijski račun: <b>${company.bankAccount}</b> ${company.bankName}; ${company.additionalInfo} </b></p>
           
        </footer>
    </div>
    </body>
</html>
`;
};
exports.htmlPage = htmlPage;
