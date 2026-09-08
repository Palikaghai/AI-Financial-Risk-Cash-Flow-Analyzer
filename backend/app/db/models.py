import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    businesses = relationship("Business", back_populates="owner")

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, default="E-Commerce")
    currency = Column(String, default="INR")
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="businesses")
    transactions = relationship("Transaction", back_populates="business", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="business", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="business", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="business", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="business", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="business", cascade="all, delete-orphan")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    total_spent = Column(Float, default=0.0)
    total_overdue = Column(Float, default=0.0)
    risk_level = Column(String, default="Low") # Low, Medium, High

    business = relationship("Business", back_populates="customers")
    invoices = relationship("Invoice", back_populates="customer")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False) # Positive number
    type = Column(String, nullable=False) # 'inflow' or 'outflow'
    category = Column(String, nullable=False, index=True) # e.g. Sales, Marketing, Salaries, Rent, Supplier, Software, Tax, Refund
    customer_name = Column(String, nullable=True)
    status = Column(String, default="Completed") # Completed, Pending, Failed
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(Text, nullable=True)
    anomaly_severity = Column(String, nullable=True) # Low, Medium, High, Critical

    business = relationship("Business", back_populates="transactions")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String, nullable=False)
    invoice_number = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False, index=True)
    status = Column(String, default="Pending") # Paid, Pending, Overdue
    overdue_days = Column(Integer, default=0)

    business = relationship("Business", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    forecast_date = Column(DateTime, nullable=False, index=True)
    predicted_balance = Column(Float, nullable=False)
    expected_inflow = Column(Float, nullable=False)
    expected_outflow = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.85)

    business = relationship("Business", back_populates="forecasts")

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    category = Column(String, nullable=False)
    recommended_action = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)

    business = relationship("Business", back_populates="anomalies")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    title = Column(String, nullable=False)
    problem = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    expected_impact = Column(String, nullable=False)
    priority = Column(String, default="Medium") # High, Medium, Low
    category = Column(String, default="Cash Flow")

    business = relationship("Business", back_populates="recommendations")

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    session_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    tools_used = Column(JSON, nullable=True) # list of tool executions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
