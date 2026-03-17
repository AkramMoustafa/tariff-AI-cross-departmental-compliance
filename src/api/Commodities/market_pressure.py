from collections import defaultdict

SUPPLIER_EXPOSURES = {

    1: {
        "metal": 0.45,
        "energy": 0.25,
        "forex": 0.20,
        "transport": 0.10
    },

    2: {
        "metal": 0.30,
        "energy": 0.15,
        "forex": 0.35,
        "transport": 0.20
    }

}

from collections import defaultdict

def calculate_metal_change(metals):

    if not metals:
        return 0

    metal_groups = defaultdict(list)

    # group prices by metal
    for m in metals:
        metal_groups[m["metal"]].append(m["price"])

    changes = []

    for metal, prices in metal_groups.items():

        if len(prices) < 2:
            continue

        newest = prices[0]
        oldest = prices[-1]

        if oldest == 0:
            continue

        change = ((newest - oldest) / oldest) * 100
        changes.append(change)

    if not changes:
        return 0

    return sum(changes) / len(changes)


def calculate_forex_change(rates):

    if not rates or len(rates) < 2:
        return 0

    newest = rates[0]["rate"]
    oldest = rates[-1]["rate"]

    if oldest == 0:
        return 0

    return ((newest - oldest) / oldest) * 100

def calculate_energy_change(energy):

    if not energy or len(energy) < 2:
        return 0

    newest = energy[0]["brent"]
    oldest = energy[-1]["brent"]

    if oldest == 0:
        return 0

    return ((newest - oldest) / oldest) * 100

def compute_market_pressure(metals, forex, energy, exposures):

    metal_pressure = 0
    forex_pressure = 0
    energy_pressure = 0

    drivers = []

    # METALS
    if metals:
        print(metals[:5])
        metal_change = calculate_metal_change(metals)
        metal_pressure = exposures.get("metal", 0) * metal_change

        if abs(metal_pressure) > 2:
            drivers.append(f"Metal price change {metal_change:.1f}%")

    # FOREX
    if forex:
        print(forex[:5])
        forex_change = calculate_forex_change(forex)
        forex_pressure = exposures.get("forex", 0) * forex_change

        if abs(forex_pressure) > 2:
            drivers.append(f"FX movement {forex_change:.1f}%")

    # ENERGY
    if energy:
        energy_change = calculate_energy_change(energy)
        energy_pressure = exposures.get("energy", 0) * energy_change

        if abs(energy_pressure) > 2:
            drivers.append(f"Energy change {energy_change:.1f}%")

    total_pressure = metal_pressure + forex_pressure + energy_pressure

    score = min(100, abs(total_pressure) * 4)

    return {
        "score": round(score, 1),
        "cost_pressure_percent": round(total_pressure, 2),
        "drivers": drivers
    }