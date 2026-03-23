import asyncio
from src.api.supplier_intelligence.Port.port_insights import save_ports_to_port_signals
async def main():
    while True:
        print("Running batch...")
        await save_ports_to_port_signals(limit=10)

        print("Sleeping 60s...")
        await asyncio.sleep(60)

        
if __name__ == "__main__":
    asyncio.run(main())
# from src.api.supplier_intelligence.Port.port_insights import get_port_activity
# import asyncio

# async def main():
#     print("Testing Los Angeles...")
#     result = await get_port_activity("LOS ANGELES")
#     print(result)

# if __name__ == "__main__":
#     asyncio.run(main())