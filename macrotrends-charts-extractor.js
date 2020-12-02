const https = require('https');
const HTMLParser = require('node-html-parser');

let stock = process.argv[2];
let date = process.argv[3];
let url = 'https://www.macrotrends.net/assets/php/stock_price_history.php?t=' + stock;

const req = https.get(url, (res) => {

  if(res.statusCode != 200) {
    console.log('Не удалось получить данные. Код: ' + res.statusCode);
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';

  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    let page = HTMLParser.parse(rawData);

    let enterance = 'var dataDaily = ';
    let scripts = page.querySelectorAll('script');
    let script;
    let scriptText;
    let data = null;
    for(let i = 0; i < scripts.length; i++) {
      script = scripts[i];

      if(script.childNodes.length > 0) {
        scriptText = script.childNodes[0].rawText;
      }else {
        continue;
      }

      let index = scriptText.indexOf(enterance);
      if(index > -1) {
        // [{.....}]
        let firstBracketIndex = index + enterance.length;
        let lastBracketIndex = scriptText.indexOf(']');

        if(scriptText[firstBracketIndex] == '[') {
          data = scriptText.slice(firstBracketIndex, lastBracketIndex + 1);
        }

      }
    }


    if(data != null) {
      data = JSON.parse(data);

      for(let i = 0; i < data.length; i++) {
        if(data[i].d == date) {
          console.log(data[i].c);
          return;
        }
      }

      console.log('Нет данных по дате - ' + date);
    }else {
      console.log('Нет данных по - ' + stock);
    }

  });

});
