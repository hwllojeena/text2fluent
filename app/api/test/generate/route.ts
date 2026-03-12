import { NextResponse } from 'next/server';

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
      "如果你的朋友来你的城市旅游，你会带他们去哪里？为什么？ (If your friends visit your city, where would you take them? Why?)"
    ],
    Advanced: [
      "在全球化背景下，你对保护传统文化有什么看法？ (In the context of globalization, what are your views on preserving traditional culture?)",
      "有人说网络让人与人的距离更近了，也有人说更远了。你怎么看？ (Some say the internet brings people closer, while others say it pushes them apart. What do you think?)",
      "探讨一下人工智能对未来教育可能产生的影响。 (Discuss the possible impact of artificial intelligence on future education.)"
    ]
  },
  es: {
    Beginner: [
      "¿Puedes presentarte y hablar sobre tus pasatiempos? (Can you introduce yourself and talk about your hobbies?)",
      "Describe cómo es tu día típico de lunes a viernes. (Describe what your typical day is like from Monday to Friday.)"
    ],
    Intermediate: [
      "¿Cuál ha sido el mejor viaje de tu vida? Describe el lugar y tus experiencias. (What has been the best trip of your life? Describe the place and your experiences.)",
      "¿Qué opinas sobre el trabajo remoto versus el trabajo en la oficina? (What do you think about remote work versus office work?)"
    ],
    Advanced: [
      "Analiza el impacto del turismo masivo en las culturas locales y el medio ambiente. (Analyze the impact of mass tourism on local cultures and the environment.)",
      "Discute cómo la tecnología cambiará el sistema educativo en los próximos años. (Discuss how technology will change the educational system in the coming years.)"
    ]
  },
  it: {
    Beginner: [
      "Puoi presentarti e parlarmi della tua famiglia? (Can you introduce yourself and tell me about your family?)",
      "Cosa ti piace fare nel tempo libero? (What do you like to do in your free time?)"
    ],
    Intermediate: [
      "Raccontami di una vacanza indimenticabile che hai fatto. (Tell me about an unforgettable vacation you took.)",
      "Quali sono i vantaggi e gli svantaggi di vivere in una grande città? (What are the advantages and disadvantages of living in a big city?)"
    ],
    Advanced: [
      "Qual è il ruolo dei social media nella società moderna e come influenzano le relazioni interpersonali? (What is the role of social media in modern society and how do they influence interpersonal relationships?)",
      "Discuti le sfide ambientali che il mondo affronta oggi e le possibili soluzioni. (Discuss the environmental challenges the world faces today and possible solutions.)"
    ]
  },
  de: {
    Beginner: [
      "Kannst du dich vorstellen und mir von deinem Hobby erzählen? (Can you introduce yourself and tell me about your hobby?)",
      "Was isst und trinkst du gerne zum Frühstück? (What do you like to eat and drink for breakfast?)"
    ],
    Intermediate: [
      "Erzähle mir von einer Reise, die dir besonders in Erinnerung geblieben ist. (Tell me about a trip that you remember particularly well.)",
      "Wie sieht deiner Meinung nach der ideale Arbeitsplatz aus? (What does the ideal workplace look like in your opinion?)"
    ],
    Advanced: [
      "Welche Auswirkungen hat der Klimawandel auf unseren Alltag und was können wir dagegen tun? (What effects does climate change have on our everyday lives and what can we do about it?)",
      "Diskutiere die Vor- und Nachteile der künstlichen Intelligenz in der modernen Industrie. (Discuss the advantages and disadvantages of artificial intelligence in modern industry.)"
    ]
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';
  const levelStr = searchParams.get('level') || 'Beginner';
  
  const languageQuestions = TEST_QUESTIONS[lang] || TEST_QUESTIONS['en'];
  const levelQuestions = languageQuestions[levelStr] || languageQuestions['Beginner'] || TEST_QUESTIONS['en']['Beginner'];

  const randomQuestion = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];

  return NextResponse.json({ question: randomQuestion });
}
