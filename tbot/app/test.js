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
}