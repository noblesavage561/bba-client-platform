interface AnthropicMessageRequest {
  apiKey: string;
  prompt: string;
  maxTokens: number;
  timeoutMs?: number;
}

interface AnthropicTextBlock {
  type?: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAnthropicTextRequest({
  apiKey,
  prompt,
  maxTokens,
  timeoutMs = 30000,
}: AnthropicMessageRequest): Promise<string> {
  const retries = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= retries.length; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as AnthropicResponse;
        const text = data.content?.find((item) => item.type === "text")?.text;
        return text || "";
      }

      if (response.status === 529 && attempt < retries.length) {
        await wait(retries[attempt]);
        continue;
      }

      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("AI analysis timed out. Please try again shortly.");
      }

      if (attempt < retries.length) {
        await wait(retries[attempt]);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Claude API request failed after retries.");
}
