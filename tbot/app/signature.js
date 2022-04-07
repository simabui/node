const crypto = require('crypto');
const SignedXml = require('xml-crypto').SignedXml;
const fs = require('fs');
const path = require('path');
const base64url = require('base64url');
const FormData = require('form-data');

function generateSignature() {
  let time = new Date().getTime();
  let data = {
    Version: 1,
    MerchantID: 1757343,
    TerminalID: 'E7885183',
    locale: 'en',
    Currency: 980,
    TotalAmount: 1000,
    PurchaseTime: time,
    OrderID: `B-${time}`,
    PurchaseDesc: 'test_B',
    Delay: 1,
    UPCToken: "4708C84FCBE2810533FFA3DDDCB7466F" 
  };
  
 
  let privateKey = fs.readFileSync( 
    path.resolve(__dirname, `../data/${data.MerchantID}.pem`),
    'utf-8',
  );
  let string = `${data.MerchantID};${data.TerminalID};${data.PurchaseTime};${data.OrderID},${data.Delay};${data.Currency};${data.TotalAmount};;`;
  const sign = crypto.createSign('RSA-SHA1');
  sign.update(string);
  const result = sign.sign(privateKey, 'base64');
  data.Signature = result;
  
  

  return {
    datafile: string,
    signature: data.Signature,
    data,
  };
}

function generateXmlAuthorized() {
  let time = new Date().getTime();
  let attributes = {
    Version: 1,
    MerchantID: '1757383',
    TerminalID: 'E7885223',
    locale: 'en',
    Currency: 980,
    TotalAmount: 1000,
    PurchaseTime: time,
    OrderID: `B-${time}`,
    PurchaseDesc: 'test_B',
  };

  let data = `<?xml version="1.0" encoding="UTF-8"?>
<ECommerceConnect
    xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://secure.upc.ua/go/pub/schema/xmlpay-1.4.xsd">
    <Message id="748112036" version="1">
        <XMLPayRequest>
            <RequestData>
                <MerchantID>${attributes.MerchantID}</MerchantID>
                <TerminalID>${attributes.TerminalID}</TerminalID>
                <Transactions>
                    <Transaction Id="999999">
                        <Preauthorization>
                            <PayData>
                                <Invoice>
                                    <OrderID>${attributes.OrderID}</OrderID>
                                    <Date>${attributes.PurchaseTime}</Date>
                                    <TotalAmount>${attributes.TotalAmount}</TotalAmount>
                                    <Currency>${attributes.Currency}</Currency>
                                    <Description>${attributes.PurchaseDesc}</Description>
                                </Invoice>
                                <Card>
                                  <CardNum>4999999999990011</CardNum>
                                  <ExpYear>2023</ExpYear>
                                  <ExpMonth>01</ExpMonth>
                                  <CVNum>123</CVNum>
                                </Card>
                            </PayData>
                        </Preauthorization>
                    </Transaction>
                </Transactions>
            </RequestData>
        </XMLPayRequest>
    </Message>
</ECommerceConnect>`;

  let sig = new SignedXml();
  sig.addReference(
    "//*[local-name(.)='ECommerceConnect']",
    ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    'http://www.w3.org/2000/09/xmldsig#sha1',
    '',
    '',
    '',
    true,
  );
  sig.signingKey = fs.readFileSync(
    path.resolve(__dirname, `../data/${attributes.MerchantID}.pem`),
  );

  sig.computeSignature(data);
  fs.writeFileSync('./data/preauthorized.xml', sig.getSignedXml());
}

function generateXmlPostAuth() {
  let attributes = {
    MerchantID: '1757343',
    TerminalID: 'E7885183',
    Currency: 980,
    TotalAmount: 1000,
    PurchaseTime: '1634023334017',
    OrderID: `B-1634023334017`,
    PurchaseDesc: 'test_B',
    ApprovalCode: '019066',
    Rrn: '128510873827',
    PostauthorizationAmount: 10,
  };

  let data = `<?xml version="1.0" encoding="UTF-8"?>
  <ECommerceConnect
      xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://secure.upc.ua/go/pub/schema/xmlpay-1.4.xsd">
      <Message id="748112037" version="1">
          <XMLPayRequest>
              <RequestData>
                  <MerchantID>${attributes.MerchantID}</MerchantID>
                  <TerminalID>${attributes.TerminalID}</TerminalID>
                  <Transactions>
                      <Transaction id="00006">
                          <Postauthorization>
                              <PostauthorizationData>
                                  <Invoice>
                                      <OrderID>${attributes.OrderID}</OrderID>
                                      <Date>${attributes.PurchaseTime}</Date>
                                      <TotalAmount>${attributes.TotalAmount}</TotalAmount>
                                      <Currency>${attributes.Currency}</Currency>
                                      <Description>${attributes.PurchaseDesc}</Description>
                                  </Invoice>
                                  <PreauthorizationRef>
                                      <ApprovalCode>${attributes.ApprovalCode}</ApprovalCode>
                                      <Rrn>${attributes.Rrn}</Rrn>
                                  </PreauthorizationRef>
                                  <PostauthorizationAmount>${attributes.PostauthorizationAmount}</PostauthorizationAmount>
                              </PostauthorizationData>
                          </Postauthorization>
                      </Transaction>
                  </Transactions>
              </RequestData>
          </XMLPayRequest>
      </Message>
  </ECommerceConnect>`;

  let sig = new SignedXml();
  sig.addReference(
    "//*[local-name(.)='ECommerceConnect']",
    ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    'http://www.w3.org/2000/09/xmldsig#sha1',
    '',
    '',
    '',
    true,
  );
  sig.signingKey = fs.readFileSync(
    path.resolve(__dirname, '../data/1757343.pem'),
  );
  sig.computeSignature(data);

  fs.writeFileSync('./data/postauthorization.xml', sig.getSignedXml());
}

function generateCancelXmlAuthorized() {
  let attributes = {
    MerchantID: '1757343',
    TerminalID: 'E7885183',
    Currency: 980,
    TotalAmount: 2000,
    RefundAmount: 2000,
    PurchaseTime: '211004100003',
    OrderID: '30ab89455d130c8e',
    PurchaseDesc: 'cancel payment',
    ApprovalCode: '859385', 
    Rrn: '127710812326',
  };

  let data = `<?xml version="1.0" encoding="UTF-8"?>
  <ECommerceConnect
      xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://secure.upc.ua/go/pub/schema/xmlpay-1.4.xsd">
      <Message id="1653690" version="1">
          <XMLPayRequest>
              <RequestData>
                  <MerchantID>${attributes.MerchantID}</MerchantID>
                  <TerminalID>${attributes.TerminalID}</TerminalID>
                  <Transactions>
                  <Transaction>
                        <Refund>
                            <RefundData>
                            <Invoice>
                            <OrderID>${attributes.OrderID}</OrderID>
                            <Date>${attributes.PurchaseTime}</Date>
                            <TotalAmount>${attributes.TotalAmount}</TotalAmount>
                            <Currency>${attributes.Currency}</Currency>
                            <Description>${attributes.PurchaseDesc}</Description>
                        </Invoice>
                        <AuthorizationRef>
                            <ApprovalCode>${attributes.ApprovalCode}</ApprovalCode>
                            <Rrn>${attributes.Rrn}</Rrn>
                        </AuthorizationRef>
                              <RefundAmount>${attributes.RefundAmount}</RefundAmount>
                            </RefundData>
                        </Refund>
                    </Transaction>
                  </Transactions>
              </RequestData>
          </XMLPayRequest>
      </Message>
  </ECommerceConnect>`;

  let sig = new SignedXml();
  sig.addReference(
    "//*[local-name(.)='ECommerceConnect']",
    ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    'http://www.w3.org/2000/09/xmldsig#sha1',
    '',
    '',
    '',
    true,
  );
  sig.signingKey = fs.readFileSync(
    path.resolve(__dirname, '../data/1757343.pem'),
  );
  sig.computeSignature(data);

  fs.writeFileSync('./data/refund.xml', sig.getSignedXml());
}

function generateGetStateXml() {
  let attributes = {
    MerchantID: '1757343',
    TerminalID: 'E7885183',
    Currency: 980,
    TotalAmount: 2000,
    PurchaseTime: '211006171532',
    OrderID: 'e8a0f929156d53b59157',
  };
 
  let data = `<?xml version="1.0" encoding="UTF-8"?>
  <ECommerceConnect
      xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="https://secure.upc.ua/go/pub/schema/xmlpay-1.4.xsd">
      <Message id="74811203426" version="1">
          <XMLPayRequest>
              <RequestData>
                  <MerchantID>${attributes.MerchantID}</MerchantID>
                  <TerminalID>${attributes.TerminalID}</TerminalID>
                  <Transactions>
                  <Transaction id="9">
                  <TransactionStateReq>
                  <TransactionStateReqData>
                      <Invoice>
                          <OrderID>${attributes.OrderID}</OrderID>
                          <Date>${attributes.PurchaseTime}</Date>
                          <TotalAmount>${attributes.TotalAmount}</TotalAmount>
                          <Currency>${attributes.Currency}</Currency>
                      </Invoice>
                  </TransactionStateReqData>
              </TransactionStateReq>
                    </Transaction>
                  </Transactions>
              </RequestData>
          </XMLPayRequest>
      </Message>
  </ECommerceConnect>`;

  let sig = new SignedXml();
  sig.addReference(
    "//*[local-name(.)='ECommerceConnect']",
    ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    'http://www.w3.org/2000/09/xmldsig#sha1',
    '',
    '',
    '',
    true,
  );
  sig.signingKey = fs.readFileSync(
    path.resolve(__dirname, '../data/1757343.pem'),
  );
  sig.computeSignature(data);

  fs.writeFileSync('./data/state.xml', sig.getSignedXml());
}

function verifyTokenSignature() {
  const body = {
    Email: '',
    TranCode: '000',
    MerchantID: '1757343',
    TerminalID: 'E7885183',
    TotalAmount: '1000',
    OrderID: '4auN0PT7U5',
    ApprovalCode: '063676',
    ProxyPan: '499999******0011',
    Delay: 1,
    Rrn: 126414799451,
    PurchaseTime: 210921145613,
    SD: '',
    XID: '21092114-780664',
    Currency: '980',
    Signature:
      'gU527idrG2P4FTQXIOJP7HQ2SaVNgn+sLxVnOSnH/8PwISfqkOxvf7w7jsCCaYhl1Z5lFC42kc/LtHxC0ro1GsEPFwZkzwmgXSvB9lkh+l4Kd8pzg2zyFSnqvOqC3+3E9sxCrWUIRd54wDF3G9Zri5YnaEwil2B4t60oMe2fZE8=',
  };
  const publicKey = fs.readFileSync(
    path.resolve(__dirname, '../data/1757343.pub'),
  );
  const verifier = crypto.createVerify('RSA-SHA256');
  const secret = Buffer.from(body.Signature, 'base64').toString('binary');
  console.log(secret);
  const data = `${body.MerchantID};${body.TerminalID};${body.PurchaseTime};${body.OrderID},${body.Delay};${body.XID};${body.Currency};;${body.TotalAmount};;;${body.TranCode};${body.ApprovalCode}`;
  verifier.update(data);

  const isVeryfy = verifier.verify(publicKey, secret, 'ascii');
  console.log({ isVeryfy });
  return isVeryfy;
}
module.exports = {
  generateSignature,
  generateXmlAuthorized,
  generateXmlPostAuth,
  generateCancelXmlAuthorized,
  verifyTokenSignature,
  generateGetStateXml,
};
