$route = "/books/1?userId=123";

autocannon -c 100 -d 10 "http://localhost:3000$route"