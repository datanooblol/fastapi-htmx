from typing import Protocol, runtime_checkable


@runtime_checkable
class AIProvider(Protocol):
    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        """Send a prompt and return the AI response as text."""
        ...
