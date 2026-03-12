import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const TEST_QUESTIONS: Record<string, Record<string, string[]>> = {
  en: {
    Beginner: [
      "Can you introduce yourself and tell me about your typical morning routine?",
      "Imagine you are at a new restaurant. How would you order your favorite meal and a drink?",
      "Describe your best friend. What do they look like and what do you like to do together?"
    ],
    Intermediate: [
      "What was the most memorable trip you have ever taken? Describe where you went and what you did.",
      "In your opinion, what are the advantages and disadvantages of working from home?",
      "Tell me about a time you had to solve a difficult problem at work or school."
    ],
    Advanced: [
      "How do you think artificial intelligence will change the job market in the next decade?",
      "Discuss the environmental impact of modern tourism and suggest ways to travel more sustainably.",
      "Evaluate the role of social media in shaping public opinion during major political events."
    ]
  },
  zh: {
    Beginner: [
      "请用中文介绍一下你自己，你喜欢做什么？ (Please introduce yourself in Chinese, what do you like to do?)",
      "你在餐厅里想点菜，你会怎么用中文对服务员说？ (If you are in a restaurant and want to order, how would you say it to the waiter in Chinese?)",
      "描述一下你周末通常做些什么。 (Describe what you usually do on weekends.)"
    ],
    Intermediate: [
      "请谈谈你最喜欢的一本书或一部电影，为什么喜欢？ (Please talk about your favorite book or movie and why you like it.)",
      "你认为学习一门外语最困难的部分是什么？你是怎么克服的？ (What do you think is the hardest part of learning a foreign language? How do you overcome it?)",
      "如果你的朋友来你的 city 旅游，你会带他们去哪里？为什么？ (If your friends visit your city, where would you take them? Why?)"
    ],
    Advanced: [
      "在全球化背景下，你对保护传统文化有什么看法？ (In the context of globalization, what are your views on preserving traditional culture?)",
      "有人说网络让人与人的距离更近了，也有人说更远了。你怎么看？ (Some say the internet brings people closer, while others say it pushes them apart. What do you think?)",
      "探讨一下人工智能对未来教育可能产生的影响。 (Discuss the possible impact of artificial intelligence on future education.)"
    ]
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';
  const levelStr = searchParams.get('level') || 'Beginner';

  const langMap: Record<string, string> = {
    en: 'English',
    zh: 'Mandarin Chinese',
    es: 'Spanish',
    it: 'Italian',
    de: 'German'
  };
  const langName = langMap[lang] || lang;

  const getFallbackQuestion = () => {
    const languageQuestions = TEST_QUESTIONS[lang] || TEST_QUESTIONS['en'];
    const levelQuestions = languageQuestions[levelStr] || languageQuestions['Beginner'] || TEST_QUESTIONS['en']['Beginner'];
    return levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
  };

  if (!genAI) {
    return NextResponse.json({ question: getFallbackQuestion() });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are a language examiner. Generate ONE open-ended test question for a student learning ${langName}.
Difficulty level: ${levelStr}.

Guidelines:
- If the language is Mandarin Chinese (zh), the question should be in Chinese characters.
- For Beginner: Ask about personal info, hobbies, or daily life.
- For Intermediate: Ask for opinions on common topics or to describe experiences.
- For Advanced: Ask for analysis of complex societal or technical issues.
- Provide ONLY the question text. Do not include instructions or translations.
    `.trim();

    const result = await model.generateContent(prompt);
    const generatedQuestion = result.response.text().trim();

    return NextResponse.json({ question: generatedQuestion || getFallbackQuestion() });
  } catch (error) {
    console.error("Gemini test generation error:", error);
    return NextResponse.json({ question: getFallbackQuestion() });
  }
}
