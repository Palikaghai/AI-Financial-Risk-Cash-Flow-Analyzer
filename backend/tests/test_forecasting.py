import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.seed_data import seed_urbankart_demo_data
from app.ml.forecasting import generate_cash_flow_forecast

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_urbankart_demo_data(session)
    yield session
    session.close()

def test_cash_flow_forecasting(db_session):
    res = generate_cash_flow_forecast(db_session, business_id=1, forecast_days=30)
    assert 'forecast_7d' in res
    assert 'forecast_14d' in res
    assert 'forecast_30d' in res
    assert len(res['forecast_7d']) == 7
    assert len(res['forecast_30d']) == 30
    assert res['current_balance'] > 0
    assert 'lowest_predicted_balance' in res
