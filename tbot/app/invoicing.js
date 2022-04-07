const fs = require('fs');
const path = require('path');
const base64url = require('base64url');
const crypto = require('crypto');

function generateTokenSignature() {
  const time = new Date().getTime();
  const headerObj = { alg: 'RS256' };
  const attributes = {
    terminalInfo: {
      merchantId: '1757343',
      terminalId: 'E7885183',
    },
    orderInfo: {
      amount: 1000,
      currencyCode: '980',
      description: 'test_B',
      fee: '0',
      orderDate: '2021-09-22 14:25:06+0300',
      orderId: crypto.randomBytes(10).toString('hex'),
    },
    invoiceLinkViewType: 'LINK',
    expirationDate: 5,
    locale: 'RU',
    operationType: 0,
    upcTokenId: '4708C84FCBE2810533FFA3DDDCB7466F',
  };

  const attributes2 = {
    Version: 1,
    MerchantID: 1757343,
    TerminalID: 'E7885183',
    locale: 'en',
    Currency: 980,
    TotalAmount: 1000,
    PurchaseTime: time,
    OrderID: crypto.randomBytes(10).toString('hex'),
    PurchaseDesc: 'test_saved_card3',
    Delay: 1,
    UPCToken: '4708C84FCBE2810533FFA3DDDCB7466F',
  };

  const privateKey = fs.readFileSync(
    path.resolve(__dirname, `../data/1757343.pem`),
  );

  let headerHashed = base64url(JSON.stringify(headerObj));
  let payloadHashed = base64url(JSON.stringify(attributes));
  let payloadHashed2 = base64url(JSON.stringify(attributes2));
  const string = `${headerHashed}.${payloadHashed}`;
  const string2 = `${headerHashed}.${payloadHashed2}`;

  const sign = crypto.createSign('RSA-SHA1');
  sign.update(string);
  const signature = sign.sign(privateKey, 'base64');

  return {
    signature,
    headerHashed,
    payloadHashed,
    payloadHashed2,
  };
}

module.exports = {
  generateTokenSignature,
};
