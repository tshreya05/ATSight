from __future__ import annotations

import json
import os
from typing import Any, Dict

import google.generativeai as genai


class GeminiService:
    def __init__(self, model_name: str = "gemini-1.5-pro") -> None:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name=model_name)

    def generate_text(self, prompt: str) -> str:
        response = self.model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0,
                top_p=0.1,
                max_output_tokens=1024,
            ),
        )
        text = (response.text or "").strip()
        if not text:
            raise RuntimeError("Gemini returned empty output.")
        return text

    def generate_json(self, prompt: str) -> Dict[str, Any]:
        text = self.generate_text(prompt)
        normalized = _strip_code_fences(text)
        return json.loads(normalized)


def _strip_code_fences(text: str) -> str:
    value = text.strip()
    if value.startswith("```"):
        value = value.split("\n", 1)[1] if "\n" in value else value
        if value.endswith("```"):
            value = value[:-3]
        value = value.strip()
        if value.lower().startswith("json"):
            value = value[4:].strip()
    return value
