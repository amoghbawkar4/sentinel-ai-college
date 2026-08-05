import json
import logging

from app.gateway.context import RequestContext
from app.gateway.detectors.base import PromptDetector
from app.gateway.detectors.jailbreak import JailbreakDetector
from app.gateway.detectors.prompt_injection import PromptInjectionDetector
from app.gateway.detectors.sensitive_keyword import SensitiveKeywordDetector

logger = logging.getLogger("sentinelai.gateway.prompt_security")


class PromptSecurityPipeline:
    """Orchestrates independent detectors without applying security decisions."""

    def __init__(self, detectors: list[PromptDetector] | None = None) -> None:
        self.detectors = detectors or [PromptInjectionDetector(), JailbreakDetector(), SensitiveKeywordDetector()]

    def process(self, context: RequestContext) -> RequestContext:
        for detector in self.detectors:
            result = detector.analyze(context)
            context.detector_results.append(result)
            logger.info(json.dumps({
                "event": "prompt_security_detector_completed",
                "request_id": context.request_id,
                "conversation_id": context.conversation_id,
                "user_id": context.user_id,
                "detector": result.detector_name,
                "status": result.status.value,
            }))
        return context
