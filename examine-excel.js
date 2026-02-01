const XLSX = require('xlsx');

// Examine all Excel files
for (let i = 1; i <= 6; i++) {
  console.log(`\n=== File ${i}.xlsx ===`);
  try {
    const wb = XLSX.readFile(`public/${i}.xlsx`);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, {header: 1});
    
    console.log('Headers:', data[0]);
    console.log('Total rows:', data.length);
    console.log('Sample row 2:', data[1]);
    if (data[2]) console.log('Sample row 3:', data[2]);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
