from app.routers import auth, loans, profile, settlement, negotiation, history

routers = [auth.router, loans.router, profile.router, settlement.router, negotiation.router, history.router]
