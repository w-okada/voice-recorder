"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const port = Number(process.env.PORT) || 8888;
const app = (0, express_1.default)();
const setting = require("../../frontend/dist/assets/setting.json");
console.log(setting);
app.get('/', (req, res) => {
    console.log("HELLO");
    res.send('Hello World!');
});
app.use('/frontend', express_1.default.static('frontend/dist/', {
    setHeaders: function (res, path) {
        res.set("Cross-Origin-Opener-Policy", "same-origin");
        res.set("Cross-Origin-Embedder-Policy", "require-corp");
    }
}));
// 設定取得
app.get("/api/setting", (req, res) => {
    console.log("SETTING");
    res.json(setting);
});
app.listen(port, () => {
    console.log(`listening on *:${port}`);
});
