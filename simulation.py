import numpy as np
from dataclasses import dataclass
import random

@dataclass
class ChargingStation:
    power: float = 11.0  # kW
    occupied_until: int = -1  # tick number

class EVSimulation:
    def __init__(self, num_stations: int = 20):
        self.stations = [ChargingStation() for _ in range(num_stations)]

        # Hourly arrival probabilities
        self.hourly_probs = {
            0: 0.0094, 1: 0.0094, 2: 0.0094, 3: 0.0094, 4: 0.0094, 5: 0.0094,
            6: 0.0094, 7: 0.0094, 8: 0.0283, 9: 0.0283, 10: 0.0566, 11: 0.0566,
            12: 0.0566, 13: 0.0755, 14: 0.0755, 15: 0.0755, 16: 0.1038, 17: 0.1038,
            18: 0.1038, 19: 0.0472, 20: 0.0472, 21: 0.0472, 22: 0.0094, 23: 0.0094
        }

        self.charging_demands = {
            0: 0.3431,    # No charging
            5: 0.0490,
            10: 0.0980,
            20: 0.1176,
            30: 0.0882,
            50: 0.1176,
            100: 0.1078,
            200: 0.0490,
            300: 0.0294
        }

        self.total_energy = 0.0
        self.max_power_demand = 0.0
        self.power_by_tick = []

        self.kwh_per_100km = 18
        self.total_ticks = 35040  # 365 days * 96 fifteen-minute intervals

    def get_arrival_probability(self, tick: int) -> float:
        hour = (tick % 96) // 4
        base_prob = self.hourly_probs[hour]
        if 16 <= hour <= 18:  
            return base_prob * 1.5  
        return base_prob

    def get_charging_demand(self) -> float:
        rand = random.random()
        cumulative_prob = 0

        for km, prob in self.charging_demands.items():
            cumulative_prob += prob
            if rand <= cumulative_prob:
                return (km * self.kwh_per_100km) / 100
        return 0

    def find_available_station(self, current_tick: int) -> int:
        for i, station in enumerate(self.stations):
            if station.occupied_until < current_tick:
                return i
        return -1

    def calculate_charging_duration(self, energy_needed: float) -> int:
        base_duration = int(np.ceil((energy_needed / 11.0) * 4))  # 11 kW charging power
        variation = random.uniform(0.8, 1.2)
        return max(2, int(base_duration * variation))

    def run_simulation(self):
        for tick in range(self.total_ticks):
            current_power = 0
            for station in self.stations:
                if station.occupied_until >= tick:
                    current_power += station.power

            self.power_by_tick.append(current_power)
            self.max_power_demand = max(self.max_power_demand, current_power)

            arrival_prob = self.get_arrival_probability(tick)

            num_attempts = 4  

            for _ in range(num_attempts):
                if random.random() < arrival_prob:
                    station_idx = self.find_available_station(tick)
                    if station_idx >= 0:
                        charge_needed = self.get_charging_demand()
                        if charge_needed > 0:
                            duration = self.calculate_charging_duration(charge_needed)
                            self.stations[station_idx].occupied_until = tick + duration
                            self.total_energy += charge_needed

        theoretical_max = len(self.stations) * self.stations[0].power
        return {
            'total_energy_kwh': self.total_energy,
            'theoretical_max_power_kw': theoretical_max,
            'actual_max_power_kw': self.max_power_demand,
            'concurrency_factor': (self.max_power_demand / theoretical_max) * 100
        }

print("Running simulations to validate results:")
print("\nTheoretical maximum should be 220 kW")
print("Actual maximum should be between 77-121 kW")
print("Concurrency factor should be between 35-55%")
print("\nResults:")

for i in range(10):
    random.seed(i)  # For reproducibility
    sim = EVSimulation(num_stations=20)
    results = sim.run_simulation()
    print(f"\nSimulation {i+1}:")
    print(f"Total Energy Consumed: {results['total_energy_kwh']:.2f} kWh")
    print(f"Theoretical Maximum Power: {results['theoretical_max_power_kw']:.2f} kW")
    print(f"Actual Maximum Power: {results['actual_max_power_kw']:.2f} kW")
    print(f"Concurrency Factor: {results['concurrency_factor']:.2f}%")