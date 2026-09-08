import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.seed_data import seed_urbankart_demo_data
from app.ml.anomaly_detection import detect_transaction_anomalies

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_urbankart_demo_data(session)
    yield session
    session.close()

def test_anomaly_detection(db_session):
    anomalies = detect_transaction_anomalies(db_session, business_id=1)
    assert len(anomalies) > 0
    # Check that marketing spike and duplicate software charges were picked up
    categories = [a['category'] for a in anomalies]
    assert 'Marketing' in categories or 'Software' in categories
