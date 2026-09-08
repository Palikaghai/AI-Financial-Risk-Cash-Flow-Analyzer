import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.seed_data import seed_urbankart_demo_data
from app.copilot.tools import CopilotToolRegistry
from app.copilot.agent import CopilotAgent

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_urbankart_demo_data(session)
    yield session
    session.close()

def test_copilot_tools(db_session):
    registry = CopilotToolRegistry(db_session, business_id=1)
    bal = registry.get_cash_balance()
    assert 'current_cash_balance' in bal
    assert bal['current_cash_balance'] > 0

    rev = registry.get_revenue(period_days=30)
    assert 'total_revenue' in rev

    ar = registry.get_overdue_receivables()
    assert ar['total_overdue_amount'] >= 0

def test_copilot_agent_grounding(db_session):
    agent = CopilotAgent(db_session, business_id=1)
    res = agent.process_query("How can I avoid the projected cash shortage?")
    assert len(res['tools_used']) > 0
    assert "Cash Shortage Diagnosis" in res['response']
    assert "MegaRetail Ltd" in res['response'] or "₹1.4L" in res['response']
