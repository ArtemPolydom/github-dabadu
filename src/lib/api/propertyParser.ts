import { PlaceResult } from '@/hooks/usePlacesAutocomplete';
import { API_CONFIG } from './config';

interface ParserCallbacks {
  onProgress: (progress: number) => void;
  onSemiResult: (summary: string) => void;
  onComplete: (result: any) => void;
  onError: () => void;
}

export async function parsePropertyInfo(
  place: PlaceResult,
  callbacks: ParserCallbacks
) {
  const requestBody = {
    search_query: `${place.name} ${place.formatted_address}`,
    country: place.country,
    property_type: 'hotel',
    semi_result: true,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/parse_property_info_stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_CONFIG.AUTH_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to connect to the server (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to initialize data stream');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines.filter((line) => line.trim())) {
        try {
          const data = JSON.parse(line);

          if (data.progress) {
            callbacks.onProgress(data.progress);
          }

          if (data.semi_summary) {
            callbacks.onSemiResult(data.semi_summary);
          }

          if (data.status === 'completed' || data.status === 'All set! Your property details are ready!') {
            if (data.result) {
              callbacks.onComplete(data.result);
            }
          }
        } catch (e) {
          if (line.trim() && !line.includes('"unique_selling_points"')) {
            callbacks.onError();
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError();
  }
}