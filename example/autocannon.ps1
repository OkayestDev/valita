& node -r ts-node/register ./express-bookstore/bookstore.app.ts &
& node -r ts-node/register ./valita-bookstore/bookstore.app.ts &

Start-Sleep -Seconds 30

$route = "/books/1?userId=123";

autocannon -c 100 -d 10 "http://localhost:3000$route" # Valita
autocannon -c 100 -d 10 "http://localhost:3001$route" # Express
