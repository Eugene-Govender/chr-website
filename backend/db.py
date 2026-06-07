"""Legacy module — connection helpers live in database.py."""

from database import check_connection, get_conn

__all__ = ["check_connection", "get_conn"]
