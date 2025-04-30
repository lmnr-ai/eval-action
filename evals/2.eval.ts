import { evaluate, LaminarDataset, HumanEvaluator } from '@lmnr-ai/lmnr';
// import { OpenAI } from 'openai';

// const client = new OpenAI({
//   apiKey: 'process.env.OPENAI_API_KEY'
// });

const getCapital = async (data: Record<string, any>) => {
  const response = ['Washington, D.C.', 'Ottawa', 'Berlin'][Math.floor(Math.random() * 3)];
  return response;

  // const country = data.country;
  // const response = await client.chat.completions.create({
  //   model: 'gpt-4.1-nano',
  //   messages: [
  //     { role: 'system', content: 'You are a helpful assistant.' },
  //     { role: 'user', content: `What is the capital of ${country}?.` }
  //   ]
  // });
  // return response.choices[0].message.content ?? '';
}

const data = [
  { "data": { "country": "United States" }, "target": "Washington, D.C." },
  { "data": { "country": "Canada" }, "target": "Ottawa" },
  { "data": { "country": "Germany" }, "target": "Berlin" },
];

const exactMatch = async (output: string, target: string) => {
  return output === target ? 1 : 0;
}

const presenceMatch = async (output: string, target: string) => {
  return output.includes(target) ? 1 : 0;
}

const wordCount = async (output: string) => {
  return output.split(' ').length;
}

evaluate<any, any, string>({
  name: 'TS eval 2',
  data,
  executor: getCapital,
  evaluators: {
    'Exact Match': exactMatch,
    'Presence Match': presenceMatch,
    'Word Count': wordCount,
  },
  config: {
    projectApiKey: process.env.LMNR_PROJECT_API_KEY,
    baseUrl: 'http://localhost',
    httpPort: 8000,
    grpcPort: 8001,
  }
})