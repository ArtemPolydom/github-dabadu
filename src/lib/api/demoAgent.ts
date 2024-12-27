import { API_CONFIG } from './config';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  business_name: string;
  business_address: string;
}

interface CreateDemoAgentRequest {
  client_data: ClientData;
  property_data: any;
  property_type: 'hotel';
}

interface DemoAgentResponse {
  status: string;
  agent: {
    id: string;
    name: string;
    phone: string;
  };
}

export async function createDemoAgent(
  data: CreateDemoAgentRequest
): Promise<DemoAgentResponse> {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/create_demo_agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_CONFIG.AUTH_TOKEN}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create demo agent error:', errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
}