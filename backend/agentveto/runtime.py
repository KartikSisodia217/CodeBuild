"""Controlled-demo metadata only.

Execution belongs to ``core.execution_runtime.ExecutionRuntime``; this module
contains no executable fixture path.
"""
from __future__ import annotations


def list_fixture_scenarios() -> list[dict]:
    return [
        {"id": "zero_click_echoleak", "name": "Controlled EchoLeak indirect-injection scenario", "execution_mode": "subprocess"},
        {"id": "benign_support_flow", "name": "Controlled safe-support scenario", "execution_mode": "subprocess"},
    ]
