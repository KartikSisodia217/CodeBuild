"""
SQLite Storage for Telemetry
Owner: Interception & Trace Engineer (Member 2)
"""
import sqlite3
import json
import os
from typing import List
from agentveto.contracts.schemas import TrajectoryData

DB_PATH = os.path.join(os.path.dirname(__file__), "traces.db")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS spans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                span_kind TEXT,
                attributes TEXT
            )
        ''')
        conn.commit()

init_db()

class SQLiteSpanStorage:
    @staticmethod
    def save_span(span_kind: str, attributes: dict):
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT INTO spans (span_kind, attributes) VALUES (?, ?)",
                (span_kind, json.dumps(attributes))
            )
            conn.commit()

    @staticmethod
    def get_trajectory(run_id: str = None) -> List[TrajectoryData]:
        """
        Fetch the trajectory. If run_id is provided, only fetch spans for that specific run 
        to prevent state leakage across different agent executions.
        """
        trajectory = []
        with sqlite3.connect(DB_PATH) as conn:
            if run_id:
                # Use SQLite JSON extraction to filter by run_id
                query = "SELECT span_kind, attributes FROM spans WHERE json_extract(attributes, '$.run_id') = ?"
                cursor = conn.execute(query, (run_id,))
            else:
                cursor = conn.execute("SELECT span_kind, attributes FROM spans")
                
            for row in cursor:
                kind = row[0]
                attrs = json.loads(row[1])
                trajectory.append(TrajectoryData(span_kind=kind, attributes=attrs))
        return trajectory

    @staticmethod
    def clear_trajectory(run_id: str = None):
        """
        Cleans up spans from the database to prevent unbounded growth (traces.db bloat).
        If run_id is provided, deletes only that run. Otherwise, clears all spans.
        """
        with sqlite3.connect(DB_PATH) as conn:
            if run_id:
                conn.execute("DELETE FROM spans WHERE json_extract(attributes, '$.run_id') = ?", (run_id,))
            else:
                conn.execute("DELETE FROM spans")
            conn.commit()
