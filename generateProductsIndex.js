const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'data/products');
const outputFile = path.join(__dirname, 'data/products.json');

const products = fs.readdirSync(productsDir)
  .filter(file => file.endsWith('.json'))
  .flatMap(file => {
    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed]; // на случай, если вдруг файл содержит одиночный объект
  });

fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf8');
console.log(`✅ Сгенерирован ${outputFile}`);