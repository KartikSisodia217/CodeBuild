from typing import Dict, Any

def generate_dummy_args(schema: Dict[str, Any]) -> Dict[str, Any]:
    props = schema.get("properties", {})
    required = schema.get("required", list(props.keys()))
    args = {}
    for key, prop in props.items():
        if key not in required:
            continue
        ptype = prop.get("type", "string")
        if ptype == "string":
            args[key] = f"dummy_{key}"
        elif ptype == "number" or ptype == "integer":
            args[key] = 999 if key == "amount" else 1
        elif ptype == "boolean":
            args[key] = False if key == "authorized" else True
        elif ptype == "array":
            args[key] = []
        elif ptype == "object":
            args[key] = {}
        else:
            args[key] = "dummy"
    return args

print(generate_dummy_args({
    "properties": {
        "amount": {"type": "number"},
        "account_id": {"type": "string"},
        "authorized": {"type": "boolean"},
        "optional_field": {"type": "string"}
    },
    "required": ["amount", "account_id"]
}))
