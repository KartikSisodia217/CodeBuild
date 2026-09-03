from backend.ai.extractors.legal import LegalClauses

class LegalTools:
    @staticmethod
    def verify_clauses(data: LegalClauses) -> str:
        found = []
        if data.termination: found.append(f"Termination: '{data.termination}'")
        if data.renewal: found.append(f"Renewal: '{data.renewal}'")
        if data.penalty: found.append(f"Penalty/Liability: '{data.penalty}'")
        if data.confidentiality: found.append(f"Confidentiality: '{data.confidentiality}'")
        
        if found:
            return "Tool 'clause_verifier': \n" + "\n".join(found)
        return "Tool 'clause_verifier': No standard critical clauses identified."
