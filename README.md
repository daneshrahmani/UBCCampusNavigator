# UBC Campus Navigator

## Overview
UBC Campus Navigator is an interactive web application that helps users explore and understand the UBC campus through an intuitive map interface. The application allows users to view building locations, find detailed room information, and get walking and cycling routes and distances between selected campus locations.

## Demo
https://www.youtube.com/watch?v=1Gi5HMDOKmw

## Features
- **Interactive Map View**: Displays UBC buildings on an interactive Google Maps interface
- **Room Selection**: Select up to 5 rooms to view detailed information
- **Room Details**: View comprehensive information for each room including:
  - Full name
  - Short name
  - Room number
  - Address
  - Seating capacity
  - Room type
  - Furniture type
- **Distance Calculations**: Calculate walking and cycling times between selected rooms, overlaying directions routes onto the map
- **Filtering System**: Filter rooms based on various criteria such as capacity and room type

## Technologies Used
### Frontend
- React.js
- Google Maps API
- react-google-maps/api Library
- TypeScript (Server implementation)

### Backend
- Node.js
- Express.js
- RESTful API architecture
- Parse5 for HTML parsing
- Geolocation services

### Testing
- Test-Driven Development (TDD) approach
- Mocha test framework
- Chai assertions

## Architecture
The application consists of three main components:
1. **Dataset Processor**: 
   - Processes HTML and JSON datasets for rooms and courses
   - Extracts building information from HTML using Parse5
   - Handles geolocation for building coordinates
   - Validates and processes course section data

2. **Query Engine**: Query system following specified EBNF, supporting:
   - Logical comparisons (AND, OR)
   - Numeric comparisons (GT, LT, EQ)
   - String pattern matching with wildcards
   - Complex data transformations:
     - Grouping by multiple fields
     - Aggregations (MAX, MIN, AVG, COUNT, SUM)
     - Multi-key sorting with direction control
   
3. **RESTful API Endpoints**:
   - PUT /dataset/:id/:kind - Add new datasets
   - DELETE /dataset/:id - Remove datasets
   - POST /query - Execute queries
   - GET /datasets - List available datasets
  
Query Examples:
```json
For Rooms:
{   
 "WHERE": {       
     "AND": [{           
        "IS": {               
            "rooms_furniture": "*Tables*"           
         }       
     }, {           
         "GT": {               
           "rooms_seats": 300           
          }       
    }]   
  },   
  "OPTIONS": {       
      "COLUMNS": [           
          "rooms_shortname",           
          "maxSeats"       
      ],       
      "ORDER": {           
         "dir": "DOWN",           
         "keys": ["maxSeats"]       
      }   
  },   
  "TRANSFORMATIONS": {       
      "GROUP": ["rooms_shortname"],       
      "APPLY": [{           
          "maxSeats": {               
              "MAX": "rooms_seats"           
           }       
      }]   
  }
}

For Sections:
{
    "WHERE": {
       "GT": {
          "sections_avg": 97
       }
    },
    "OPTIONS": {
       "COLUMNS": [
          "sections_dept",
          "sections_avg"
       ],
       "ORDER": "sections_avg"
    }
}
```

## Setup and Installation

### Prerequisites
- Git (v2.X or higher)
- Node.js (v18.X or higher)
- NPM (comes with Node.js)
- Yarn (1.22.X or higher)

### Installation Steps
1. Clone the repository:
```bash
git clone https://github.com/daneshrahmani/UBCCampusNavigator.git
cd UBCCampusNavigator
```
2. Install dependencies:
```bash
yarn install
```
3. Build the Project:
```bash
yarn build
```
4. Run the application:
```bash
yarn start
```
Available Commands:
- yarn build: Compile the project
- yarn test: Run the test suite
- yarn cover: Run tests with coverage report
- yarn prettier:fix: Format code
- yarn lint:check: Check for lint errors
- yarn lint:fix: Automatically fix lint errors where possible
