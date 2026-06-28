"""
Claude CLI provider — calls `claude -p` as a subprocess.

Known issues encountered and resolved:

1. COMMAND NOT FOUND: On Windows, subprocess.run(["claude", ...]) without
   shell=True uses a limited PATH that doesn't include ~/.local/bin/.
   Fix: shell=True so the system shell resolves the command.

2. NULL BYTES: PDF-extracted text can contain \x00 characters. These cause
   "embedded null character" errors in subprocess.
   Fix: strip \x00 from prompt before sending.

3. SPECIAL CHARACTERS: PDF text contains quotes, backticks, $, etc. Passing
   these as command-line arguments breaks shell parsing.
   Fix: pipe prompt via stdin (input=prompt) instead of as a CLI argument.

4. FULL PATH BREAKS: shutil.which() resolves to a full .EXE path on Windows
   (e.g., C:\\Users\\...\\claude.EXE) which then fails with FileNotFoundError.
   Fix: just use "claude" as the command name, let shell=True resolve it.

5. ENCODING: Windows defaults to cp1252 encoding which mangles Unicode.
   Fix: always pass encoding="utf-8" to subprocess.run().
"""

import asyncio
import subprocess


class ClaudeCLIProvider:

    def __init__(self, command: str = "claude"):
        self.command = command

    def _run(self, prompt: str, timeout: int = 120) -> str:
        prompt = prompt.replace("\x00", "")

        result = subprocess.run(
            [self.command, "-p", "-"],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=timeout,
            shell=True,
        )

        if result.returncode != 0:
            error_msg = result.stderr.strip() or "Unknown error"
            return f"[AI Error: {error_msg}]"
        return result.stdout.strip()

    def generate(self, prompt: str, system_prompt: str | None = None) -> str:
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        try:
            return self._run(full_prompt)
        except subprocess.TimeoutExpired:
            return "[AI Error: Request timed out after 120 seconds]"
        except FileNotFoundError:
            return f"[AI Error: '{self.command}' command not found. Is Claude CLI installed?]"
        except Exception as e:
            return f"[AI Error: {e}]"

    async def agenerate(self, prompt: str, system_prompt: str | None = None) -> str:
        return await asyncio.to_thread(self.generate, prompt, system_prompt)
