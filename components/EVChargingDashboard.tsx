"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Define type for hourly probabilities
type HourlyProbabilities = {
  [hour: number]: number;
};

// T1: Arrival Probabilities
const HOURLY_ARRIVAL_PROBS: HourlyProbabilities = {
  0: 0.0094, 1: 0.0094, 2: 0.0094, 3: 0.0094, 4: 0.0094, 5: 0.0094,
  6: 0.0094, 7: 0.0094, 8: 0.0283, 9: 0.0283, 10: 0.0566, 11: 0.0566,
  12: 0.0566, 13: 0.0755, 14: 0.0755, 15: 0.0755, 16: 0.1038, 17: 0.1038,
  18: 0.1038, 19: 0.0472, 20: 0.0472, 21: 0.0472, 22: 0.0094, 23: 0.0094
};

// T2: Charging Demand Probabilities
const CHARGING_DEMANDS = [
  { range: 0, probability: 0.3431 },    // No charging
  { range: 5, probability: 0.0490 },
  { range: 10, probability: 0.0980 },
  { range: 20, probability: 0.1176 },
  { range: 30, probability: 0.0882 },
  { range: 50, probability: 0.1176 },
  { range: 100, probability: 0.1078 },
  { range: 200, probability: 0.0490 },
  { range: 300, probability: 0.0294 }
];

// Interfaces
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

interface CardProps {
  title: string;
  children: React.ReactNode;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

interface ChargepointData {
  id: string;
  averagePower: number;
  peakPower: number;
  utilization: number;
}

interface PowerData {
  hour: string;
  power: number;
}

interface EventData {
  period: string;
  events: number;
}

interface SimulationStats {
  totalEnergy: number;
  eventsPerDay: number;
  maxPower: number;
  concurrencyFactor: number;
}

// Helper function to get charging demand based on probability
const getChargingDemand = (consumption: number): number => {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const demand of CHARGING_DEMANDS) {
    cumulative += demand.probability;
    if (rand <= cumulative) {
      return (demand.range * consumption) / 100; // Convert km range to kWh
    }
  }
  return 0;
};

// Custom Components
const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
  );
};

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

const Select: React.FC<SelectProps> = ({ value, onChange, options }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full p-2 border rounded-md bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const EVChargingDashboard: React.FC = () => {
  // Input state
  const [numChargePoints, setNumChargePoints] = useState<number>(20);
  const [arrivalMultiplier, setArrivalMultiplier] = useState<number>(100);
  const [consumption, setConsumption] = useState<number>(18);
  const [chargingPower, setChargingPower] = useState<number>(11);
  const [timeFilter, setTimeFilter] = useState<string>('day');

  // Output state
  const [mockDayData, setMockDayData] = useState<Array<PowerData>>([]);
  const [mockStats, setMockStats] = useState<SimulationStats>({
    totalEnergy: 0,
    eventsPerDay: 0,
    maxPower: 0,
    concurrencyFactor: 0
  });
  const [chargepointData, setChargepointData] = useState<Array<ChargepointData>>([]);
  const [eventsData, setEventsData] = useState<Array<EventData>>([]);

  useEffect(() => {
    // Generate mock data for an exemplary day using actual probabilities
    const generateMockDayData = (): PowerData[] => {
      const data: PowerData[] = [];
      let maxPowerUsed = 0;
      let totalEnergyForDay = 0;
      
      for (let hour = 0; hour < 24; hour++) {
        const baseProb = HOURLY_ARRIVAL_PROBS[hour];
        const arrivalProb = baseProb * (arrivalMultiplier / 100);
        
        // Calculate active chargers and their power demand
        const activeChargers = Math.round(numChargePoints * arrivalProb * (1 + Math.random() * 0.5));
        let totalPower = 0;
        
        // For each active charger, calculate its power demand based on charging needs
        for (let i = 0; i < activeChargers; i++) {
          const chargingDemand = getChargingDemand(consumption);
          // If there's a charging demand, calculate power used
          if (chargingDemand > 0) {
            // Assume charging takes 1 hour on average
            const powerNeeded = Math.min(chargingPower, chargingDemand);
            totalPower += powerNeeded;
            totalEnergyForDay += powerNeeded;
          }
        }
        
        maxPowerUsed = Math.max(maxPowerUsed, totalPower);
        
        data.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          power: Math.round(totalPower * 10) / 10
        });
      }
      
      // Update stats
      const theoreticalMax = numChargePoints * chargingPower;
      setMockStats(prev => ({
        ...prev,
        maxPower: Math.round(maxPowerUsed * 10) / 10,
        concurrencyFactor: Math.round((maxPowerUsed / theoreticalMax) * 100),
        totalEnergy: Math.round(totalEnergyForDay * 365) // Extrapolate to annual
      }));
      
      return data;
    };

    const generateMockStats = (): SimulationStats => {
      const dailyArrivals = Object.values(HOURLY_ARRIVAL_PROBS).reduce((sum, prob) => 
        sum + prob * numChargePoints * 24 * (arrivalMultiplier / 100), 0
      );
      
      // Calculate average energy per charging session using the charging demand distribution
      const avgEnergyPerCharge = CHARGING_DEMANDS.reduce((sum, demand) => 
        sum + (demand.range * consumption / 100) * demand.probability, 0
      );

      return {
        totalEnergy: 0, // Will be updated by generateMockDayData
        eventsPerDay: Math.round(dailyArrivals),
        maxPower: 0, // Will be updated by generateMockDayData
        concurrencyFactor: 0 // Will be updated by generateMockDayData
      };
    };

    const generateChargepointData = (): ChargepointData[] => {
      return Array.from({ length: numChargePoints }, (_, i) => {
        const utilization = Math.min(100, Math.round(
          (arrivalMultiplier / 100) * 
          Object.values(HOURLY_ARRIVAL_PROBS).reduce((sum, prob) => sum + prob * 100, 0)
        ));
        
        // Calculate average power based on charging demand distribution
        const avgPowerFactor = CHARGING_DEMANDS.reduce((sum, demand) => {
          if (demand.range === 0) return sum; // Skip no-charge events
          const powerNeeded = Math.min(chargingPower, (demand.range * consumption / 100));
          return sum + (powerNeeded * demand.probability);
        }, 0) / (1 - CHARGING_DEMANDS[0].probability); // Adjust for no-charge probability
        
        return {
          id: `CP${i + 1}`,
          averagePower: Math.round((avgPowerFactor * utilization / 100) * 10) / 10,
          peakPower: chargingPower,
          utilization
        };
      });
    };

    const generateEventsData = (): EventData[] => {
      const baseEventsPerDay = Object.values(HOURLY_ARRIVAL_PROBS).reduce((sum, prob) => 
        sum + prob * numChargePoints * 24 * (arrivalMultiplier / 100), 0
      );
      
      const data: EventData[] = [];
      
      switch (timeFilter) {
        case 'year':
          for (let month = 0; month < 12; month++) {
            data.push({
              period: `${month + 1}/2024`,
              events: Math.round(baseEventsPerDay * 30)
            });
          }
          break;
        case 'month':
          for (let day = 1; day <= 30; day++) {
            data.push({
              period: `Day ${day}`,
              events: Math.round(baseEventsPerDay)
            });
          }
          break;
        case 'week':
          for (let day = 1; day <= 7; day++) {
            data.push({
              period: `Day ${day}`,
              events: Math.round(baseEventsPerDay)
            });
          }
          break;
        case 'day':
          for (let hour = 0; hour < 24; hour++) {
            data.push({
              period: `${hour.toString().padStart(2, '0')}:00`,
              events: Math.round(baseEventsPerDay * HOURLY_ARRIVAL_PROBS[hour])
            });
          }
          break;
      }
      
      return data;
    };

    const stats = generateMockStats();
    setMockStats(stats);
    setMockDayData(generateMockDayData());
    setChargepointData(generateChargepointData());
    setEventsData(generateEventsData());
  }, [numChargePoints, arrivalMultiplier, consumption, chargingPower, timeFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card title="EV Charging Station Parameters">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Charge Points: {numChargePoints}
              </label>
              <Slider
                value={numChargePoints}
                onChange={setNumChargePoints}
                min={1}
                max={30}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Probability Multiplier: {arrivalMultiplier}%
              </label>
              <Slider
                value={arrivalMultiplier}
                onChange={setArrivalMultiplier}
                min={20}
                max={200}
                step={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Consumption (kWh/100km): {consumption}
              </label>
              <Slider
                value={consumption}
                onChange={setConsumption}
                min={12}
                max={24}
                step={0.5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charging Power per Point (kW): {chargingPower}
              </label>
              <Slider
                value={chargingPower}
                onChange={setChargingPower}
                min={3.7}
                max={22}
                step={0.1}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Exemplary Day Power Usage">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Key Statistics">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Energy (Annual)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockStats.totalEnergy.toLocaleString()} kWh
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Daily Charging Events</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockStats.eventsPerDay}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maximum Power Demand</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockStats.maxPower} kW
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Concurrency Factor</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockStats.concurrencyFactor}%
              </p>
            </div>
          </div>
        </Card>

        <Card title="Chargepoint Performance">
          <div className="h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Chargepoint</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
										Avg Power (kW)
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium">
										Peak Power (kW)
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium">
										Utilization (%)
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{chargepointData.map((cp) => (
									<tr key={cp.id}>
										<td
											className="px-4 py-2 text-sm"
										>
											{cp.id}
										</td>
										<td
											className="px-4 py-2 text-sm"
										>
											{cp.averagePower}
										</td>
										<td
											className="px-4 py-2 text-sm"
										>
											{cp.peakPower}
										</td>
										<td
											className="px-4 py-2 text-sm"
										>
											{cp.utilization}%
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>

				<Card title="Charging Events">
					<div className="mb-4">
						<Select
							value={timeFilter}
							onChange={setTimeFilter}
							options={[
								{ value: "day", label: "Day View" },
								{ value: "week", label: "Week View" },
								{ value: "month", label: "Month View" },
								{ value: "year", label: "Year View" },
							]}
						/>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={eventsData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="period" />
								<YAxis
									label={{
										value: "Number of Events",
										angle: -90,
										position: "insideLeft",
									}}
								/>
								<Tooltip />
								<Bar
									dataKey="events"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default EVChargingDashboard;
