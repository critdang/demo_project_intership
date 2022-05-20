const express = require('express');

let configViewEngine = (app) => {
    // static để server biết chỉ được lấy data từ đâu
    app.use(express.static("./public"));
    app.set("view engine","ejs");
    // đườn link lấy view engine
    app.set("views","./views");
}

module.exports = configViewEngine