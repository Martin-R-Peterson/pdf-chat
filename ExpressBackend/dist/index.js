"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'));
    }
};
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), fileFilter: pdfFileFilter });
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
let extractedText = '';
app.post('/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Wrong fileformat' });
            throw new Error();
        }
        const pdfBuffer = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer;
        if (pdfBuffer != undefined) {
            const data = yield (0, pdf_parse_1.default)(pdfBuffer);
            extractedText = data.text;
            res.json({ documentId: (_b = req.file) === null || _b === void 0 ? void 0 : _b.filename });
        }
        else {
            throw new Error();
        }
    }
    catch (error) {
        res.status(500).json({ error: 'PDF parse error' });
    }
    ;
}));
app.post('/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { documentId, message } = req.body;
    try {
        const response = yield openai.completions.create({
            model: 'text-davinci-003',
            prompt: `Document context: ${extractedText}\n\nUser: ${message}\nBot:`,
            max_tokens: 150,
        });
        res.json(response.choices[0].text.trim());
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get response from OpenAI' });
    }
}));
app.listen(3001, () => {
    console.log('Server started on port 3001');
});
