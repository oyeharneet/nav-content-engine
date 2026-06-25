import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  // Extract video ID
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  if (!match) return res.status(400).json({ error: 'Invalid YouTube URL' });

  const videoId = match[1];

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    const text = transcript.map(t => t.text).join(' ');
    const trimmed = text.substring(0, 3000);
    return res.status(200).json({ transcript: trimmed });
  } catch (e) {
    return res.status(500).json({ error: 'Could not fetch transcript. Video may have captions disabled.' });
  }
}
