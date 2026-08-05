import json
import logging

from app.gateway.context import RequestContext
from app.gateway.prompt_security_pipeline import PromptSecurityPipeline
from app.gateway.risk.engine import RiskIntelligenceEngine

logger = logging.getLogger("sentinelai.gateway.risk")


class PromptPipeline:
    def __init__(self, pipeline: PromptSecurityPipeline | None = None) -> None:
        self.pipeline = pipeline or PromptSecurityPipeline()

    def process(self, context: RequestContext) -> RequestContext:
        return self.pipeline.process(context)


class AuthorizationEngine:
    def authorize(self, context: RequestContext) -> RequestContext:
        # TODO: Add authorization evaluation in a future phase.
        return context


class RiskEngine:
    def __init__(self, engine: RiskIntelligenceEngine | None = None) -> None:
        self.engine = engine or RiskIntelligenceEngine()

    def evaluate(self, context: RequestContext) -> RequestContext:
        context.risk_assessment = self.engine.assess(context.detector_results)
        assessment = context.risk_assessment
        logger.info(json.dumps({
            "event": "risk_assessment_completed",
            "request_id": context.request_id,
            "conversation_id": context.conversation_id,
            "user_id": context.user_id,
            "detectors_executed": assessment.total_detector_count,
            "highest_detector": assessment.highest_detector,
            "overall_score": assessment.overall_score,
            "overall_confidence": assessment.overall_confidence,
            "overall_severity": assessment.overall_severity.value,
            "recommended_action": assessment.recommended_action.value,
        }))
        return context


class PolicyEngine:
    def evaluate(self, context: RequestContext) -> RequestContext:
        # TODO: Add policy evaluation in a future phase.
        return context


class ResponsePipeline:
    def process(self, context: RequestContext, response: str) -> str:
        # TODO: Add response-security processing in a future phase.
        return response


class AuditLogger:
    def record(self, context: RequestContext, event: str) -> RequestContext:
        # TODO: Persist gateway audit events in a future phase.
        return context
