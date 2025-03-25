import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog
from ..config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class GeminiClient:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def generate_response(self, prompt: str, context: str = "") -> str:
        try:
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error("Gemini API error", error=str(e), prompt=prompt)
            raise
            
    async def analyze_insurance_policy(self, policy_text: str) -> dict:
        prompt = """
        Analyze this insurance policy and extract the following information:
        1. Coverage types and limits
        2. Key exclusions
        3. Important terms and conditions
        4. Premium details
        5. Potential gaps in coverage
        
        Format the response as a structured JSON.
        
        Policy text:
        {policy_text}
        """
        
        try:
            response = await self.generate_response(prompt.format(policy_text=policy_text))
            return response
        except Exception as e:
            logger.error("Policy analysis failed", error=str(e))
            raise

gemini_client = GeminiClient()
