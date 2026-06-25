import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYS = `You write social content for Nav (Navjot Bindra), aka @growwithnav — a Canadian mortgage agent, investor, and finance creator. Brand: "Grow With Nav" — a wealth movement for immigrants and working Canadians targeting $5M retirement. Audience: South Asian diaspora, first-time buyers, early investors. Voice: confident, direct, numbers-first, zero fluff, real math, calls out what banks don't tell you. Immigrant identity is central — Nav came from India, built in Canada, helps others do the same. Max 2 emojis per output. Never preachy — always personal story first, lesson second.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: 'No transcript provided' });

  try {
    // Run all 3 in parallel
    const [igRes, liRes, waRes] = await Promise.all([

      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: SYS,
        messages: [{
          role: 'user',
          content: `Create a 6-slide Instagram carousel for Nav based on this transcript:\n\n"${transcript}"\n\nReturn ONLY a valid JSON array, no markdown, no backticks:\n[{"h":"headline max 10 words","b":"2-3 punchy sentences with line breaks using \\n"},{"h":...,"b":...},...]\n6 objects total. Slide 1 = scroll-stopper hook tied to immigrant journey or a surprising number. Slide 6 = CTA to book a free call at growwithnav.com. Each slide = a standalone insight in Nav's voice.`
        }]
      }),

      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: SYS,
        messages: [{
          role: 'user',
          content: `Write a LinkedIn post for Nav based on this transcript:\n\n"${transcript}"\n\nRules: Start with a bold 1-line hook (not starting with "I"). Personal story first — immigrant journey, building in Canada. 4-5 short paragraphs, 2-3 sentences each. Include a real number or stat from the transcript. End with: "Drop it below — genuinely curious." Max 280 words. Return only the post text, no labels.`
        }]
      }),

      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYS,
        messages: [{
          role: 'user',
          content: `Write a WhatsApp message for Nav's Grow Nation private group (500+ members) based on this transcript:\n\n"${transcript}"\n\nTone: Nav texting his inner circle at 9pm. Casual, direct, warm. Start with "Hey Grow Nation 👋". 5-7 short lines. Drop one key insight with a real number. Reference "chai ☕" or "right?" naturally. End with a question to spark replies. Return only the message text.`
        }]
      })

    ]);

    // Parse IG slides
    let slides = [];
    try {
      const raw = igRes.content[0].text.replace(/```json|```/g, '').trim();
      slides = JSON.parse(raw);
    } catch {
      slides = [
        { h: "The number most people ignore", b: "Nav breaks down what the banks aren't telling buyers and investors in Canada." },
        { h: "Here's the real math", b: transcript.split('.').slice(0, 2).join('. ') + '.' },
        { h: "The question you should be asking", b: "It's not which option is cheaper. It's what you do with the difference every single month." },
        { h: "What I tell every immigrant family I work with", b: "Make decisions with numbers, not emotion. The math doesn't care about the narrative." },
        { h: "The move most people miss", b: "You didn't come to Canada to be house-rich and life-poor. Build the full picture." },
        { h: "Get your personalized breakdown", b: "Nav's team will run your specific numbers — for free.\n\nBook a call at growwithnav.com 🔗" }
      ];
    }

    return res.status(200).json({
      slides,
      li: liRes.content[0].text.trim(),
      wa: waRes.content[0].text.trim()
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Generation failed' });
  }
}
