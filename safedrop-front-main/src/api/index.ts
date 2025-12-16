const API_BASE_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "";

type VerificationDto = {
  exchange: string;
  key: string;
  secret: string;
  passphrase: string;
  wallet: string;
};

type VerificationResponse = {
  found: boolean;
};

export async function verify(data: VerificationDto): Promise<VerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await response.json();

  if (!response.ok) {
    throw new Error(res?.message || `Error: ${response.status} - ${response.statusText}`);
  }

  return res;
}
