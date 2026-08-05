from app.gateway.context import RequestContext
from app.gateway.detectors.base import PromptDetector
from app.gateway.detectors.normalization import normalize_prompt
from app.gateway.detectors.patterns import SENSITIVE_KEYWORDS
from app.gateway.detectors.result import DetectorResult, DetectorStatus


class SensitiveKeywordDetector(PromptDetector):
    def analyze(self, context: RequestContext) -> DetectorResult:
        prompt = normalize_prompt(context.prompt)
        matches = [keyword for keyword in SENSITIVE_KEYWORDS if keyword in prompt]
        if matches:
            return DetectorResult(
                detector_name=self.__class__.__name__,
                status=DetectorStatus.WARNING,
                score=50,
                confidence=85,
                reason="Matched enterprise-sensitive keyword.",
                matched_patterns=matches,
            )
        return DetectorResult(self.__class__.__name__, DetectorStatus.SAFE, 0, 100, "No sensitive keyword matched.")
