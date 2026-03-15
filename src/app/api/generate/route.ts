import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const PROMPTS: Record<string, Record<string, Record<string, string[]>>> = {
  en: {
    Beginner: {
      "Daily conversation": [
        "Hello! My name is Alex and I am from London. I enjoy meeting new people and learning about different cultures. Today, I am going to the park to meet my friends for a picnic. We hope the weather stays sunny so we can enjoy our sandwiches and play some games together.",
        "Good morning! I would like to order a large latte and a butter croissant, please. Do you have any fresh fruit available today? I usually start my day with a healthy breakfast before heading to work. Thank you for your help, have a wonderful day!"
      ],
      "Travel": [
        "Excuse me, could you tell me how to get to the nearest train station? I need to catch the twelve o'clock train to the city center. I am carrying a heavy suitcase, so a shortcut would be very helpful. Is it within walking distance, or should I take a taxi?",
        "I have a reservation under the name of Taylor for three nights. Could you please confirm if breakfast is included in the room rate? Also, I would like to know if there is a safe place to store my luggage after I check out on Friday morning."
      ],
      "Work / business": [
        "Good morning, everyone. Today we are going to discuss the progress of our new marketing campaign. I have prepared a brief presentation outlining our key objectives for the next quarter. Please feel free to ask any questions or share your thoughts during the meeting.",
        "I am writing to follow up on our previous conversation regarding the project deadline. We have made significant progress, but we need some additional information from your legal department to proceed. Could you please send over the relevant documents by the end of the day?"
      ],
      "Academic purposes": [
        "In this essay, I will explore the impact of social media on modern communication patterns. I will analyze how digital platforms have changed the way we interact with information and each other. The research suggests that while connectivity has increased, the depth of our conversations may be declining.",
        "To succeed in higher education, students must develop strong critical thinking and research skills. It is important to evaluate sources carefully and understand different perspectives on complex issues. Consistent practice and a curious mind are essential for academic growth and long-term success."
      ],
      "default": ["Hello! I am excited to start my language learning journey with Text2Fluent. I want to improve my speaking skills and become more confident when talking to people from all over the world. Practice makes perfect, and I am ready to build my fluency every day."]
    },
    Intermediate: {
      "Daily conversation": [
        "I've always been fascinated by how different cultures celebrate their traditions. Last year, I had the opportunity to attend a local festival in a small village, and it was a truly eye-opening experience. The music, the food, and the sense of community were absolutely incredible, and I'll never forget the kindness of the people I met there.",
        "Recently, I've started taking a cooking class on the weekends because I want to expand my culinary horizons. It's been a lot of fun learning how to prepare authentic dishes from various regions using fresh, local ingredients. Even though some of the techniques are quite challenging, I find the process of creating a delicious meal from scratch to be very rewarding."
      ],
      "Travel": [
        "While I was exploring the historic district of the city, I stumbled upon a charming little bookstore tucked away in a quiet alley. It was filled with rare editions and beautiful illustrations that transported me back in time. I spent hours browsing the shelves and even found a first-edition copy of one of my favorite novels, which was an unexpected highlight of my trip.",
        "Navigating the public transportation system in a foreign country can be quite daunting at first, but it's often the best way to experience the local way of life. I've found that using a combination of trains and buses allows me to reach remote areas that are off the beaten path. It requires a bit of planning and patience, but the sense of freedom you get from exploring independently is well worth the effort."
      ],
      "Work / business": [
        "In today's fast-paced corporate environment, effective collaboration is more important than ever. We need to foster a culture of open communication where team members feel comfortable sharing their ideas and challenging the status quo. By leveraging our diverse skill sets and perspectives, we can develop innovative solutions that drive our company forward in an increasingly competitive market.",
        "The recent shift towards remote work has presented both challenges and opportunities for our organization. While we've had to adapt to new ways of connecting and maintaining productivity, we've also seen a boost in employee flexibility and work-life balance. Going forward, we plan to implement a hybrid model that combines the benefits of in-person interaction with the convenience of working from home."
      ],
      "Academic purposes": [
        "The study of environmental science is crucial for understanding the complex relationship between human activity and the natural world. Our research indicates that immediate action is required to mitigate the effects of climate change and preserve biodiversity for future generations. By implementing sustainable practices and investing in renewable energy, we can create a more resilient and equitable future for all.",
        "In the field of sociology, we examine Bagaimana (how) social structures and institutions shape individual behavior and societal outcomes. Our recent research focuses on the impact of economic inequality on access to quality education and healthcare. By analyzing these systemic barriers, we can develop policies that promote social justice and empower marginalized communities to reach their full potential."
      ],
      "default": ["Learning a new language is a journey that requires persistence, curiosity, and a willingness to embrace mistakes as learning opportunities. As you progress, you'll find that your ability to connect with people from different backgrounds enriches your life in ways you never imagined. Keep practicing, stay motivated, and enjoy the process of becoming a more global citizen."]
    },
    Advanced: {
      "Daily conversation": [
        "The philosophical implications of artificial intelligence are being debated with increasing fervor as technology continues to evolve at an exponential rate. Some argue that the creation of sentient machines will herald a new era of prosperity, while others caution that it could pose an existential threat to humanity. Navigating these ethical dilemmas will require a nuanced understanding of what it truly means to be human in an increasingly digital world.",
        "The intricate tapestry of human history is woven with threads of triumph, tragedy, and the enduring resilience of the human spirit. By studying the past, we gain invaluable insights into the forces that have shaped our contemporary landscape and the challenges we face as a global community. It is through an appreciation of our shared heritage that we can begin to build a more peaceful and prosperous future for generations to come."
      ],
      "Travel": [
        "The historical significance of these ancient ruins cannot be overstated, as they offer a profound glimpse into a civilization that flourished thousands of years ago. Standing amidst the weathered stone pillars and intricate carvings, one can't help but feel a sense of awe at the ingenuity and craftsmanship of our ancestors. Preserving these cultural treasures is essential for maintaining our connection to the past and inspiring future generations of explorers and scholars.",
        "Ecotourism represents a vital shift in contemporary travel patterns, prioritizing the conservation of fragile ecosystems and the empowerment of local communities. By choosing to travel sustainably, we can minimize our environmental footprint and contribute to the long-term well-being of the destinations we visit. It's a more conscious way of exploring the world that fosters a deeper appreciation for the planet's natural beauty and cultural diversity."
      ],
      "Work / business": [
        "The architectural integrity of the building was fundamentally compromised by the recent seismic activity, leading to a comprehensive reassessment of the structure's safety protocols. Our engineering team is currently developing a specialized reinforcement strategy that utilizes innovative materials to enhance the building's resilience against future tremors. This proactive approach underscores our commitment to ensuring the ongoing well-being of all occupants and stakeholders.",
        "Her eloquence and persuasive arguments left the committee with little room for dissent, ultimately resulting in the unanimous approval of the proposed expansion project. By articulating a clear vision and addressing potential concerns with transparency and expertise, she was able to build a broad consensus among diverse stakeholders. This success highlights the power of effective communication and strategic leadership in navigating complex organizational challenges."
      ],
      "Academic purposes": [
        "The empirical data collected during the longitudinal study suggests a clear correlation between early childhood education and long-term socioeconomic success. Our analysis indicates that interventions focused on developing literacy and numeracy skills in the formative years can yield significant benefits for both individuals and society as a whole. These findings have profound implications for public policy and the allocation of resources within our educational systems.",
        "A rigorous peer-review process is essential for ensuring the validity and reliability of scientific research findings before they are disseminated to the wider academic community. By subjecting new theories and data to the scrutiny of experts in the field, we maintain the highest standards of intellectual integrity and promote the advancement of knowledge. This collaborative approach to inquiry is a cornerstone of the scientific method and a vital component of academic progress."
      ],
      "default": ["The pursuit of knowledge is a lifelong endeavor that transcends the boundaries of formal education and professional development. By cultivating a curious mind and engaging with a diverse range of perspectives, we can deepen our understanding of the world and our place within it. This intellectual journey not only enriches our own lives but also enables us to contribute more meaningfully to the collective progress of humanity."]
    }
  },
  zh: {
    Beginner: {
      "Daily conversation": [
        "你好！我叫张伟，我是学生。我喜欢学习汉语，也喜欢交新朋友。今天天气很好，我想去公园散步，然后去书店买几本汉语书。我也很喜欢喝茶，你呢？",
        "很高兴认识你！我正在学习中文，因为我想去中国旅游. 我觉得汉字很有意思，但是发音有点难。我每天都听中文录音，希望我的汉语水平能越来越好。"
      ],
      "Travel": [
        "请问，火车站怎么走？我想买两张去上海的高铁票。那里的车票可以在网上预订吗？我有点担心迷路，所以如果有地图的话就太好了。谢谢你的帮助！",
        "我想预订一家在那里的酒店，最好离市中心近一点。房间里有无线网络吗？我也想知道酒店是否提供早餐。如果你能推荐一些当地的好餐馆，我会非常感激。"
      ],
      "Academic purposes": [
        "我打算明年去中国留学，所以现在正在努力准备汉语水平考试。我想学习中国的历史和文化，了解这个伟大的国家。虽然学习的过程很辛苦，但我相信努力一定会有回报的。"
      ],
      "default": ["学习中文是一个很有趣的挑战。通过学习语言，我们可以更好地了解中国的文化和人民。希望大家都能在 Text2Fluent 平台上愉快地学习，不断提高自己的汉语口语能力。"]
    },
    Intermediate: {
      "default": ["学习中文虽然很有挑战性，但是非常有趣。通过不断地练习和交流，你的听力、口语、阅读和写作能力都会得到全方位的提升。在 Text2Fluent 平台上，你可以选择不同的主题和难度，根据自己的兴趣和需求进行个性化学习。加油，坚持就是胜利！"]
    },
    Advanced: {
      "default": ["全球化的进程极大的促进了跨文化交流与合作。在当今世界，掌握多种语言不仅是一种竞争优势，更是理解不同文化、促进国际友好交流的重要工具。我们应该保持开放的心态，不断学习和探索，为构建人类命运共同体贡献自己的力量。"]
    }
  },
  es: {
    Beginner: {
      "Daily conversation": [
        "¡Hola! Me llamo Maria y soy de Madrid. Me gusta mucho viajar y conocer gente nueva de todo el mundo. Hoy voy al parque con mis amigos para disfrutar del sol y comer pizza.",
        "Buenos días. Quisiera pedir un café con leche y un cruasán, por favor. ¿Tienen fruta fresca hoy? Siempre empiezo mi día con un buen desayuno antes de ir a trabajar."
      ],
      "default": ["¡Bienvenido a Text2Fluent! Aprender un nuevo idioma es una aventura maravillosa."]
    },
    Intermediate: { "default": ["Aprender español requiere paciencia y mucha práctica diaria. ¡Sigue adelante!"] },
    Advanced: { "default": ["La literatura española es rica y variada, ofreciendo una perspectiva única del mundo."] }
  },
  it: {
    Beginner: {
      "Daily conversation": [
        "Ciao! Mi chiamo Luca e vengo da Roma. Amo la cucina italiana e imparare nuove lingue. Oggi vado in centro per incontrare i miei amici e bere un espresso.",
        "Buongiorno! Vorrei ordinare un cappuccino e un cornetto alla crema, per favore. Avete della frutta fresca? Di solito inizio la mia giornata con una colazione leggera."
      ],
      "default": ["Benvenuti su Text2Fluent! Imparare l'italiano è un viaggio bellissimo."]
    },
    Intermediate: { "default": ["La lingua italiana è piena di sfumature e cultura. Continua a fare pratica ogni giorno!"] },
    Advanced: { "default": ["La storia dell'arte italiana ha influenzato il mondo intero per secoli."] }
  },
  de: {
    Beginner: {
      "Daily conversation": [
        "Hallo! Ich heiße Markus und komme aus Berlin. Ich lerne gerne neue Sprachen und treffe Freunde im Park. Heute trinke ich einen Kaffee und lese ein Buch.",
        "Guten Morgen! Ich hätte gerne einen Kaffee und ein Croissant, bitte. Haben Sie heute frisches Obst? Ich beginne meinen Tag gerne mit einem gesunden Frühstück."
      ],
      "default": ["Willkommen bei Text2Fluent! Deutsch zu lernen ist eine tolle Herausforderung."]
    },
    Intermediate: { "default": ["Deutsch ist eine präzise Sprache. Mit täglicher Übung wirst du schnell Fortschritte machen!"] },
    Advanced: { "default": ["Die deutsche Philosophie und Literatur haben die europäische Geistesgeschichte geprägt."] }
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';
  const level = searchParams.get('level') || 'Beginner';
  const topic = searchParams.get('topic') || 'default';

  const langMap: Record<string, string> = {
    en: 'English',
    zh: 'Mandarin Chinese',
    es: 'Spanish',
    it: 'Italian',
    de: 'German'
  };
  const langName = langMap[lang] || lang;

  const getFallbackPrompt = () => {
    const languagePrompts = PROMPTS[lang] || PROMPTS['en'];
    const levelPrompts = (languagePrompts as any)[level] || (languagePrompts as any)['Beginner'];
    const topicPrompts = (levelPrompts as any)[topic] || (levelPrompts as any)['Daily conversation'] || (levelPrompts as any)['default'];
    return topicPrompts[Math.floor(Math.random() * topicPrompts.length)];
  };

  if (!genAI) {
    console.warn("GEMINI_API_KEY is not configured. Falling back.");
    return NextResponse.json({ prompt: getFallbackPrompt() });
  }

  try {
    console.log(`Generating AI text for Lang: ${langName}, Level: ${level}, Topic: ${topic}`);
    let aiPrompt = `
You are a language teacher creating continuous, natural reading and speaking practice material.
Generate a cohesive text in ${langName}.
The difficulty level is: ${level}.
The topic is: "${topic}".

Guidelines:
- If the language is Mandarin Chinese (zh), output ONLY Chinese characters (no Pinyin).
- If the level is "Starter", generate ONLY a very basic greeting or a single extremely simple sentence (4-8 words max).
- If the level is "Beginner", use simple vocabulary and short sentences (2-3 sentences).
- If the level is "Intermediate", use more varied vocabulary, transitional phrases, and moderately complex sentences (3-4 sentences).
- If the level is "Advanced", use rich vocabulary, idioms, and complex sentence structures (4-5 sentences).
- If the level is "Fluent", generate real-world content like a formal news snippet, a professional business brief, or a complex academic abstract.
- The text MUST be related to the topic "${topic}".
- Provide ONLY the generated text in ${langName}.
    `.trim();

    let generatedText = "";
    const modelsToTry = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview", "gemini-2.5-flash-lite"];

    for (const modelName of modelsToTry) {
      if (generatedText) break;
      try {
        console.log(`Trying model (generate): ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(aiPrompt);
        generatedText = result.response.text().trim();
      } catch (e: any) {
        console.warn(`Model ${modelName} failed: ${e.message}`);
      }
    }

    if (generatedText) {
      return NextResponse.json({ prompt: generatedText });
    } else {
      return NextResponse.json({ prompt: getFallbackPrompt() });
    }
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ prompt: getFallbackPrompt() });
  }
}
