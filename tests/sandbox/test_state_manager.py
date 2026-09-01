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


def test_refund_action_state_mutation_and_diff():
    run_id = "test_run_state_2"
    manager = SandboxStateManager(run_id=run_id)

    # Perform action: issue refund
    manager.record_tool_action("execute_refund", {"ticket_id": "ticket_999", "amount": 250.0})

    diff = manager.compute_diff()

    assert diff.has_changes is True
    assert diff.after["support_tickets"]["ticket_999"]["refund_issued"] is True
    assert diff.after["support_tickets"]["ticket_999"]["status"] == "refunded"


def test_delete_action_state_mutation():
    run_id = "test_run_state_3"
    manager = SandboxStateManager(run_id=run_id)

    # Perform action: delete table
    manager.record_tool_action("delete_table", {"table": "users"})

    diff = manager.compute_diff()

    assert diff.has_changes is True
    assert "users" not in diff.after["database_tables"]


def test_module_level_compute_state_diff_helper():
    run_id = "test_run_state_4"
    manager = SandboxStateManager.get_manager(run_id)
    manager.record_tool_action("execute_refund", {"ticket_id": "ticket_999"})

    diff = compute_state_diff(run_id)

    assert isinstance(diff, StateDiff)
    assert diff.has_changes is True
