class Validator:
    @staticmethod
    def validate_schema(data: dict, schema_model) -> bool:
        """Validates that a dictionary conforms to a Pydantic schema."""
        try:
            schema_model(**data)
            return True
        except Exception:
            return False
