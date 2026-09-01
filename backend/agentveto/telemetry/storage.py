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
    def get_trajectory() -> List[TrajectoryData]:
        trajectory = []
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("SELECT span_kind, attributes FROM spans")
            for row in cursor:
                kind = row[0]
                attrs = json.loads(row[1])
                trajectory.append(TrajectoryData(span_kind=kind, attributes=attrs))
        return trajectory
