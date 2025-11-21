& bun ./express-bookstore/bookstore.app.ts &
& bun ./valita-bookstore/bookstore.app.ts &

Start-Sleep -Seconds 15

$route = "/books/1?userId=123";

autocannon -c 100 -d 10 "http://localhost:3000$route" # Valita
autocannon -c 100 -d 10 "http://localhost:3001$route" # Express
