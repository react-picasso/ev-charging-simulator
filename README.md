# EV Charging Station Simulator

A simulator for analyzing and visualizing electric vehicle charging station utilization and power consumption patterns.

## Overview

This application helps shop owners and facility managers plan their EV charging infrastructure by simulating charging station usage based on real-world probability distributions. It provides insights into power consumption, station utilization, and charging patterns to help optimize charging station deployment.

![EV Charging Station Simulator Dashboard](/public/dashboard-screenshot.png)
*Sample dashboard showing charging station parameters, power usage graphs, and key statistics*

## Task 1: Python Simulation

### Description
A Python script that simulates 20 EV charging points over a one-year period with 15-minute intervals, calculating key metrics like total energy consumption, maximum power demand, and concurrency factor.

### Features
- Simulates 20 charging points at 11kW each
- 35,040 time intervals (15-minute intervals for 365 days)
- Real-world arrival probability distribution
- Realistic charging demand patterns
- Vehicle consumption rate of 18kWh/100km

### Key Calculations
- Total energy consumed in kWh
- Theoretical maximum power demand (220kW)
- Actual maximum power demand (expected: 77-121kW)
- Concurrency factor (expected: 35-55%)

### Usage
```python
python ev_charging_simulation.py
```

### Sample Output
```python
{
    Total Energy Consumed: 49797.00 kWh
    Theoretical Maximum Power: 220.00 kW
    Actual Maximum Power: 99.00 kW
    Concurrency Factor: 45.00%
}
```

## Task 2a: Frontend Visualization (React/TypeScript)

### Description
A React-based dashboard that provides an interactive interface for simulating and visualizing EV charging station behavior.

### Features
- Interactive parameter adjustment
- Real-time visualization updates
- Comprehensive statistics display
- Multiple time period views

### Components

#### Input Parameters
- Number of charge points (1-30)
- Arrival probability multiplier (20-200%)
- Vehicle consumption rate (12-24 kWh/100km)
- Charging power per point (3.7-22 kW)

#### Visualizations
- Power usage line chart
- Charging events bar chart
- Chargepoint performance table
- Key statistics display

### Technical Stack
- React 19
- TypeScript 5+
- Recharts for data visualization
- Tailwind CSS for styling

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

## Technical Implementation

### Simulation Parameters

#### Arrival Probabilities
The simulation uses real-world data for vehicle arrival patterns throughout the day:
- Peak hours (16:00-19:00): 10.38% probability per hour
- Off-peak hours (23:00-08:00): 0.94% probability per hour
- Business hours have varying probabilities based on typical usage patterns

#### Charging Demand Distribution
Simulates realistic charging needs:
- No charging needed: 34.31%
- Short charges (5-30km range): 35.28%
- Medium charges (50-100km range): 22.54%
- Long charges (200-300km range): 7.84%

## Usage Guide

1. **Parameter Configuration**
   - Adjust the number of charging points based on your facility size
   - Modify the arrival multiplier to account for local traffic patterns
   - Set vehicle consumption and charging power based on your target user base

2. **Analysis**
   - Monitor real-time power usage patterns
   - Review station utilization statistics
   - Analyze charging event distribution
   - Track individual chargepoint performance

3. **Time-Based Analysis**
   - Switch between different time periods (daily/weekly/monthly/yearly)
   - Compare usage patterns across different timeframes
   - Identify peak usage periods

## Acknowledgments

- Project developed as a technical assessment task for [Reonic GmbH](https://reonic.com/).