from fastapi import APIRouter

from src.api.Commodities.metal_price_services import (
    fetch_price_data,
    save_forex_rates,
    save_to_metalprice,
    extract_energy_data
)

router = APIRouter(prefix="/commodities", tags=["Commodities"])


@router.post("/metals")
def save_metal_prices(symbol: str = "XAU", weeks: int = 20, supplier_id: int = 1):

    df = fetch_price_data(symbol, weeks)

    data = save_to_metalprice(df, supplier_id, symbol)

    return {
        "symbol": symbol,
        "data": data
    }


@router.post("/forex")
def save_forex(symbol: str = "EUR", weeks: int = 20, supplier_id: int = 1):

    df = fetch_price_data(symbol, weeks)

    data = save_forex_rates(df, supplier_id)

    return {
        "symbol": symbol,
        "data": data
    }


@router.post("/energy")
def save_energy():

    data = extract_energy_data()

    return {
        "data": data
    }

if __name__ == "__main__":

    # print("Running commodities debug test...\n")

    # print("Testing metal price fetch...")
    df = fetch_price_data("XAU", weeks=3)

    # print("Metal dataframe:")
    print(df)

    if not df.empty:
        # print("Saving metal prices...")
        result = save_to_metalprice(df, supplier_id=6, symbol="XAU")
        print("Saved metal records:", result)
    else:
        print("No metal data returned!")

    print("\nTesting forex fetch...")
    df = fetch_price_data("EUR", weeks=3)

    # print("Forex dataframe:")
    # print(df)

    if not df.empty:
        # print("Saving forex rates...")
        result = save_forex_rates(df, supplier_id=6)
        # print("Saved forex records:", result)
    else:
        print("No forex data returned!")

    # print("\nTesting energy extraction...")
    energy = extract_energy_data()

    # print("Energy data:")
    # print(energy[:5])

    # print("\nDebug run finished.")