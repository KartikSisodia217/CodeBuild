from typing import Any, Dict
from backend.ai.memory.blackboard import BlackboardState

def merge_blackboard_state(existing_state: Any, updates: Dict[str, Any]) -> BlackboardState:
    """
    Reducer function to merge updates into the BlackboardState Pydantic model.
    Takes the existing state and a dictionary of updates returned by an agent.
    """
    if existing_state is None:
        return BlackboardState(**updates)
        
    # The checkpointer restores state from JSON as a dict
    if isinstance(existing_state, dict):
        existing_state = BlackboardState(**existing_state)
        
    state_dict = existing_state.model_dump()
    
    for key, value in updates.items():
        if key in state_dict:
            # For simplicity, we overwrite objects. In a more complex scenario,
            # we might want to recursively merge dictionaries or append to lists.
            state_dict[key] = value
            
    return BlackboardState(**state_dict)
