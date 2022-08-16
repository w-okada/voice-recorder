import express from "express";

const port: number = Number(process.env.PORT) || 18888;
const app = express();

const setting = require("../../frontend/dist/assets/setting.json");
console.log(setting);


app.get('/', (req, res) => {
    console.log("HELLO")
    res.send('Hello World!')
})

app.use('/frontend', express.static('frontend/dist/', {
    setHeaders: function (res, path) {
        res.set("Cross-Origin-Opener-Policy", "same-origin");
        res.set("Cross-Origin-Embedder-Policy", "require-corp");
    }
}));

// 設定取得
app.get("/api/setting", (req, res) => {
    console.log("SETTING")
    res.json(setting);
});


app.listen(port, () => {
    console.log(`listening on *:${port}`);
})