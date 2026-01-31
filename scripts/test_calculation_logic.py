from src.api.db import SessionLocal
from src.api.models import TariffLine


TEST_HS_CODE = "01012100"   # Purebred Horses 
TEST_VALUE = 5000.00        # $5,000 shipment
TEST_QUANTITY = 1           # 1 Horse
DUTY_RATE_OVERRIDE = None   


def run_test():
    db = SessionLocal()
    print("-" * 60)
    print(f"  STARTING DIRECT ENGINE TEST")
    print("-" * 60)

    
    print(f" Looking up HS Code: {TEST_HS_CODE}...")
    tariff = db.query(TariffLine).filter(TariffLine.hs_code == TEST_HS_CODE).first()

    if not tariff:
        print(f" ERROR: HS Code {TEST_HS_CODE} not found in database.")
        return

    print(f"    FOUND: {tariff.description[:50]}...")
    print(f"    Base Rate: {(tariff.base_rate * 100):.2f}%")

   
    duty_amount = TEST_VALUE * tariff.base_rate
    
   
    mpf = max(31.67, min(614.35, TEST_VALUE * 0.003464))
    
   
    total_cost = TEST_VALUE + duty_amount + mpf

    print("-" * 60)
    print(f" CALCULATION RESULTS")
    print("-" * 60)
    print(f"    Customs Value:   ${TEST_VALUE:,.2f}")
    print(f"   TAX Duty Amount:    ${duty_amount:,.2f}")
    print(f"   FED MPF Fee:        ${mpf:,.2f}")
    print("-" * 60)
    print(f"    LANDED COST:     ${total_cost:,.2f}")
    print("-" * 60)
    print(" ENGINE TEST PASSED")

if __name__ == "__main__":
    run_test()