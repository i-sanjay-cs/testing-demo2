import multiparty from 'multiparty';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';

const API_KEY = 'AIzaSyBYJ7Sa-fA3u_AvRAIofSaFukg7Ab3yuIk'; // Replace with your API key

// Disable default body parser for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new multiparty.Form();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files', err);
      return res.status(500).json({ error: 'Error parsing the files' });
    }

    // Get the file data from `files` object
    const file = files.file ? files.file[0] : null;  // Adjust based on the field name used in your form
    if (!file || !file.path) {
      console.error('No file provided');
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      // Read file content into a buffer
      const readFile = promisify(fs.readFile);
      const fileBuffer = await readFile(file.path);

      // Transcribe the audio using Google Cloud Speech-to-Text
      const response = await axios.post(
        `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${API_KEY}`,
        {
          config: {
            encoding: 'WEBM_OPUS',  // Adjust encoding based on your file type
            sampleRateHertz: 48000, // Adjust sample rate based on your file
            languageCode: 'en-US',
          },
          audio: {
            content: fileBuffer.toString('base64'),  // Encode the file buffer to base64
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract the transcription
      const transcription = response.data.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      // Respond with the transcription result
      res.status(200).json({ transcription });
    } catch (error) {
      console.error('Failed to transcribe audio', error);
      res.status(500).json({ error: 'Failed to transcribe audio' });
    }
  });
}
