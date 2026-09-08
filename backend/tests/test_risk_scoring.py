import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.seed_data import seed_urbankart_demo_data
from app.ml.risk_scoring import calculate_cashflow_risk_score

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_urbankart_demo_data(session)
    yield session
    session.close()

def test_risk_scoring(db_session):
    risk_info = calculate_cashflow_risk_score(db_session, business_id=1)
    assert 0 <= risk_info['score'] <= 100
    assert risk_info['risk_level'] in ['Low', 'Medium', 'High', 'Critical']
    assert len(risk_info['contributing_factors']) > 0
    assert len(risk_info['reasons']) > 0
