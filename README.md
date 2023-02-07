# WISE 1.0.x-beta Demo

## What it does

This will spin up 2 containers, one on Ubuntu 20.04 FOCAL and one on Ubuntu 22.04 and will sue the most recent release or developer release of WISE 1.x.x

These are simple containers that:

- Run the wise engine for a single well-defined model (FGMJ File) and writes its outputs to the shared folder.

## How to use it

To use these tests/demo in your environment:
- clone the repo
- checkout the  wise_latest branch to work with the most recent release of WISE.
- edit the ```.env``` file and change the HOST_DATA_FOLDER section:

```txt
HOST_DATA_FOLDER=/path/to/wise/demo_data
```

to match a folder on the container host. so if on the host folder you are sharing with your container is:
```/home/myuser/myfolder``` then your modified HOST_DATA_FOLDER section in ```.env``` file would look like:

```shell
HOST_DATA_FOLDER=/home/myuser/myfolder
```

Now you need to run the installer
eg:

```shell
sh install_container.sh
```

this will setup the project, build the images, and launch the containers with the new images.

Each container will run and exit displaying the outputs on in the container logs. If you examine the container logs, they should look like this:

```docker
> base_typescript@1.0.0 model
> node dist/model.js
Clearing old results
Running the job
The job validated
stdout: 
The job was executed
stdout: 
Reading the results
Prometheus Fire Growth Model (Version 1.0.0-beta released on 2023-01-18)

FGM File Name: job
Date of Report: January 22, 2023 15:50

Simulation Settings:
 Scenario Inputs:
  Name: ZF035-21 Best Case Scenario
  Start Time: July 25, 2021 13:00:00
  End Time:   July 26, 2021 13:00:00
  Ignitions:
   Name: ign5
  Fuel Breaks:
  Active Grids and Patches:
   Name: wthrptch10
  Weather Stream:
   wthrstn5: wthrstrm5   [July 25, 2021 00:00:00] - [August  4, 2021 00:59:59]
  Comments:
  This is the best case Scenario

 Burning Conditions:
  Date           Start       End   HISI >  HFWI >    WS >    RH <
  2021/07/25  00:00:00  23:59:59       0      19    0.00      95
  2021/07/26  00:00:00  23:59:59       0      19    0.00      95
 Fire Weather: True
  Spatially interpolate FWI System values: False
  Calculate FWI System values from spatially interpolated weather: False
  Recursively calculate FWI System values from spatially interpolated weather: True
 Fire Behavior:
  FMC Settings:
   FMC (%) Override: False
  Terrain Effect On:                    True
  Green-up on:                         False
  Grass Phenology on:                  False
  Grass Curing on:                     False
  Breaching:                            True
  Spotting:                             True
  Percentile Rate of Spread:           False
 Propagation:
  Display interval: 24:00:00
  Maximum time step during acceleration: 00:02:00
  Distance resolution (Grid Cells):  Dynamic
  Perimeter resolution (Grid Cells): Dynamic
  Stop fire spread at data boundary:   False
  Purge non-displayable time steps:    False

Landscape Properties:
 Grid Information:
  Cell Size (m): 250.0
  Columns and Rows: 199 x 189
  Grid Size: 49.75 km x 47.25 km

 Location of Lower Left Corner:
  62.809148�,-117.111409�

 Elevation Statistics (m):
  Min:    156.0
  Max:    324.0
  Mean:   214.0
  Median: 214.0

 Time Zone Settings:
  Time Zone: MDT Mountain Daylight Time -6:00:00

 Project Comments:

Landscape Grids:
 Projection:     dataset
 Fuel Grid:      fuels
 Look-up Table:  Inputs/dataset.lut
 Elevation Grid: elevation

Fuel Patches:
 Landscape Fuel Type Patch:
 Polygon Fuel Type Patch:
Active Fuel Types :
 101: C-1 Spruce-Lichen Woodland (C-1) [ ]
 102: C-2 Boreal Spruce (C-2) [ ]
 108: D-1/D-2 Aspen (D-1/D-2) [ ]
 31, 116: O-1a Matted Grass (O-1a) [ 60.00% Deg. of Curing; 0.35kg/m² Grass Fuel Load ]
 40, 109: M-1 Boreal Mixedwood - Leafless (M-1) [ 50.00 PC ]
 40, 109: M-1 Boreal Mixedwood - Leafless (M-1) [ 50.00 PC ]
 119: Non-fuel (Non-fuel) [ ]
 118: Water (Non-fuel) [ ]

Active Fuel Types (modified):

Weather Station:
 Name: wthrstn5
 Coordinates:  63.072420�,-116.746515�
 Elevation:    100.0 m
 Weather Stream Name: wthrstrm5
  Start Date: July 25, 2021 00:00:00
  End Date:   August  4, 2021 00:59:59
  Imported From File:                     True
  Imported From Ensemble:                 False
  Any Data Generated From Diurnal Curves: False
  Any Data User Modified:                 False
  Yesterday's Daily Starting Codes:
   FFMC:                                 80.6
   DMC:                                  45.1
   DC:                                  376.2
   Precipitation (13:00:01 - 23:59:59):   1.5 mm
  Today's Hourly Starting Code:
   FFMC:                                 94.0
   @ Hour:                                N/A
  FWI Values:
   Using calculated FWI System values
  Method of Hourly FFMC Calculation:

n

Weather Patches:

Weather Grids:
 Name: wthrptch10
  Start Time: July 25, 2021 13:00:00
  End Time:   July 26, 2021 13:00:00
   Comments:
    ZF035-21 Best Case Patch

Ignitions:
 Name: ign5
  Start Time: July 25, 2021 13:00:00
  Ignition Type: Polygon
  Comments:

Prometheus Fire Growth Model (Version 1.0.0-beta released on 2023-01-18)

FGM File Name: job
Date of Report: January 22, 2023 15:50

Simulation Settings:
 Scenario Inputs:
  Name: ZF035-21 Worst Case Scenario
  Start Time: July 25, 2021 13:00:00
  End Time:   July 26, 2021 13:00:00
  Ignitions:
   Name: ign5
  Fuel Breaks:
  Active Grids and Patches:
   Name: wthrptch11
  Weather Stream:
   wthrstn5: wthrstrm5   [July 25, 2021 00:00:00] - [August  4, 2021 00:59:59]
  Comments:
  This is the worst case Scenario

 Burning Conditions:
  Date           Start       End   HISI >  HFWI >    WS >    RH <
  2021/07/25  00:00:00  23:59:59       0      19    0.00      95
  2021/07/26  00:00:00  23:59:59       0      19    0.00      95
 Fire Weather: True
  Spatially interpolate FWI System values: False
  Calculate FWI System values from spatially interpolated weather: False
  Recursively calculate FWI System values from spatially interpolated weather: True
 Fire Behavior:
  FMC Settings:
   FMC (%) Override: False
  Terrain Effect On:                    True
  Green-up on:                         False
  Grass Phenology on:                  False
  Grass Curing on:                     False
  Breaching:                            True
  Spotting:                             True
  Percentile Rate of Spread:           False
 Propagation:
  Display interval: 24:00:00
  Maximum time step during acceleration: 00:02:00
  Distance resolution (Grid Cells):  Dynamic
  Perimeter resolution (Grid Cells): Dynamic
  Stop fire spread at data boundary:   False
  Purge non-displayable time steps:    False

Landscape Properties:
 Grid Information:
  Cell Size (m): 250.0
  Columns and Rows: 199 x 189
  Grid Size: 49.75 km x 47.25 km

 Location of Lower Left Corner:
  62.809148�,-117.111409�

 Elevation Statistics (m):
  Min:    156.0
  Max:    324.0
  Mean:   214.0
  Median: 214.0

 Time Zone Settings:
  Time Zone: MDT Mountain Daylight Time -6:00:00

 Project Comments:

Landscape Grids:
 Projection:     dataset
 Fuel Grid:      fuels
 Look-up Table:  Inputs/dataset.lut
 Elevation Grid: elevation

Fuel Patches:
 Landscape Fuel Type Patch:
 Polygon Fuel Type Patch:
Active Fuel Types :
 101: C-1 Spruce-Lichen Woodland (C-1) [ ]
 102: C-2 Boreal Spruce (C-2) [ ]
 108: D-1/D-2 Aspen (D-1/D-2) [ ]
 31, 116: O-1a Matted Grass (O-1a) [ 60.00% Deg. of Curing; 0.35kg/m² Grass Fuel Load ]
 40, 109: M-1 Boreal Mixedwood - Leafless (M-1) [ 50.00 PC ]
 40, 109: M-1 Boreal Mixedwood - Leafless (M-1) [ 50.00 PC ]
 119: Non-fuel (Non-fuel) [ ]
 118: Water (Non-fuel) [ ]

Active Fuel Types (modified):

Weather Station:
 Name: wthrstn5
 Coordinates:  63.072420�,-116.746515�
 Elevation:    100.0 m
 Weather Stream Name: wthrstrm5
  Start Date: July 25, 2021 00:00:00
  End Date:   August  4, 2021 00:59:59
  Imported From File:                     True
  Imported From Ensemble:                 False
  Any Data Generated From Diurnal Curves: False
  Any Data User Modified:                 False
  Yesterday's Daily Starting Codes:
   FFMC:                                 80.6
   DMC:                                  45.1
   DC:                                  376.2
   Precipitation (13:00:01 - 23:59:59):   1.5 mm
  Today's Hourly Starting Code:
   FFMC:                                 94.0
   @ Hour:                                N/A
  FWI Values:
   Using calculated FWI System values
  Method of Hourly FFMC Calculation:


Weather Patches:

Weather Grids:
 Name: wthrptch11
  Start Time: July 25, 2021 13:00:00
  End Time:   July 26, 2021 13:00:00
   Comments:
    ZF035-21 Worst Case Patch

Ignitions:
 Name: ign5
  Start Time: July 25, 2021 13:00:00
  Ignition Type: Polygon
  Comments:
  
```
