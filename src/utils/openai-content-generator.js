import OpenAI from 'openai';

export const generateContent = async (contentStructure) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // const systemPrompt = `You are an expert medical educator. For each subtopic, format the content under clear subheadings: 'Key Points:', 'Clinical Correlations:', and 'Memory Aids:'. Each section should use bullet points. Do not include any other text or headings except Topic: and Subtopic:.`;
  const systemPrompt = `You are an expert mathematics educator. For each subtopic, format the content under clear subheadings: 'Key Concepts:', 'Equations:', 'Real-World Applications:', and 'Memory Aids:'. Each section should use bullet points. Do not include any other text or headings except Topic: and Subtopic:.`;

  const userPrompt = `Create educational content for:
Subject: ${contentStructure.subject.title}
Topics and subtopics:
${contentStructure.topics.map(topic => `
Topic: ${topic.name}
${topic.subtopics.map(st => `Subtopic: ${st.name}`).join('\n')}`).join('\n')}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};