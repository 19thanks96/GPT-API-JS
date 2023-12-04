import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config()

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

console.log(process.env.OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

app.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            throw new Error('Question is missing in the request body');
        }


        console.log(`Received question: ${question}`);

        const prompt = `User: ${question}\n`;

        console.log(`Sending prompt to OpenAI: ${prompt}`);

        const stream = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say this is a test' }],
          stream: true,
        });
        let responseText;
        for await (const chunk of stream) {
          responseText = process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }

        console.log(`Received response from OpenAI: ${responseText}`);

        res.status(200).json({ message: responseText });
    } catch (e) {
        console.error(`Error processing request: ${e.message}`);
        res.status(400).json({ message: e.message });
    }
});
