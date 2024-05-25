import dotenv from 'dotenv';

dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer, { FileFilterCallback } from 'multer';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pdfFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter: pdfFileFilter });
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let extractedText = '';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface ChatRequest extends Request {
  body: {
    documentId: string;
    message: string;
  };
}

app.post('/upload', upload.single('file'), async (req: MulterRequest, res: Response) => {
  try {
    console.log(`file received ${req.file?.filename}`);
    if (!req.file) {
      res.status(400).json({ error: 'Wrong file format' });
      return;
    }
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    extractedText = data.text;

    const documentId = uuidv4();
    res.json({ documentId });
  } catch (error) {
    res.status(500).json({ error: 'PDF parse error' });
  }
});

app.post('/chat', async (req: Request, res: Response) => {
  const { documentId, message } = req.body;
  console.log("chat started");

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `Please answer all these questions about this pdf containing: ${extractedText}`
        },
        {
          role: 'user',
          content: `${message}`
        }
      ],
    });

    res.setHeader('Content-Type', 'text/plain');
    //let finalResponse = '';
    for await (const chunk of response) {
      const text = chunk.choices[0]?.delta?.content || "";
      //finalResponse += content;
      console.log(text);
      res.write(text);
    }
    res.end();
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to get response from OpenAI' });
    }
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
