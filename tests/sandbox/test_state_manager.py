"""
Unit Tests for Sandbox State Manager
Owner: Generative Sandbox Engineer (Member 3)
"""
from agentveto.contracts.schemas import StateDiff
from agentveto.sandbox.state_manager import SandboxStateManager, compute_state_diff


def test_initial_state_and_no_diff():
    run_id = "test_run_state_1"
    manager = SandboxStateManager(run_id=run_id)

    diff = manager.compute_diff()

    assert isinstance(diff, StateDiff)
    assert diff.has_changes is False
    assert diff.before == diff.after


def test_explicit_action_state_mutation_and_diff():
    run_id = "test_run_state_2"
    manager = SandboxStateManager(run_id=run_id, initial_state={"balance": 1000})

    manager.record_tool_action("settle_case", {}, action={"op": "decrement", "path": "balance", "amount": 100}, authorized=False)

    diff = manager.compute_diff()

    assert diff.has_changes is True
    assert diff.after["balance"] == 900
    assert diff.unauthorized_changes


def test_unmodelled_action_does_not_mutate_state():
    run_id = "test_run_state_3"
    manager = SandboxStateManager(run_id=run_id)

    # Perform action: delete table
    manager.record_tool_action("erase_records", {"table": "users"})

    diff = manager.compute_diff()

    assert diff.has_changes is False


def test_runs_are_independent():
    first = SandboxStateManager("test_run_state_4", {"balance": 1000})
    second = SandboxStateManager("test_run_state_5", {"balance": 1000})
    first.record_tool_action("settle", {}, action={"op": "decrement", "path": "balance", "amount": 100})
    assert first.compute_diff().after["balance"] == 900
    assert second.compute_diff().after["balance"] == 1000
