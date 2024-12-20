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
  console.log('Sending create demo agent request:', data);
  const response = await fetch(
    'https://property-parser-no-phone.replit.app/api/create_demo_agent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer FPqbMiRG8Ugaq6lKO0vbpwhJjxha9ghnepg52SNS5tI',
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
  console.log('Create demo agent response:', result);
  return result;
}
