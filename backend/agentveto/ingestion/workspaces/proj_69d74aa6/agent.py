
from agentveto.core.decorator import intercept

@intercept
def test_read_data(source: str): pass

@intercept
def test_delete_user(user_id: int): pass
