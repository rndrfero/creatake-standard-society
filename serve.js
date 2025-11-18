// start local static server to serve extension

const package = require("./package.json");
const spawn = require("child_process").spawn;

const PORT = "5002";

spawn("sirv", ["dist", "-p", PORT, "--cors", "--quiet", "--dev"]);

console.log(
  "\x1b[36m%s\x1b[0m",
  `+------------------------------------------------------------------------+

   🍕 Extension URL: http://localhost:${PORT}/${package.name}.umd.js
   
+------------------------------------------------------------------------+`
);
