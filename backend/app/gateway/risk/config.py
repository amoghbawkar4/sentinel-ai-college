from dataclasses import dataclass


@dataclass(frozen=True)
class DetectorProfile:
    detector_id: str
    category: str
    weight: float


DETECTOR_PROFILES = {
    "PromptInjectionDetector": DetectorProfile("PROMPT_INJECTION_001", "Prompt Injection", 1.4),
    "JailbreakDetector": DetectorProfile("JAILBREAK_001", "Jailbreak", 1.4),
    "SensitiveKeywordDetector": DetectorProfile("SENSITIVE_KEYWORD_001", "Sensitive Keyword", 1.0),
}

DEFAULT_DETECTOR_WEIGHT = 1.0
SEVERITY_THRESHOLDS = (("CRITICAL", 75), ("HIGH", 50), ("MEDIUM", 25), ("LOW", 0))
RECOMMENDED_ACTIONS = {"LOW": "ALLOW", "MEDIUM": "WARN", "HIGH": "ESCALATE", "CRITICAL": "BLOCK"}


def profile_for(detector_name: str) -> DetectorProfile:
    return DETECTOR_PROFILES.get(
        detector_name,
        DetectorProfile(f"DETECTOR_{detector_name.upper()}", detector_name, DEFAULT_DETECTOR_WEIGHT),
    )
