The hypothetical company OptoKom SE sells equipment for optical networks, e.g. optical switches.

For the demo configurator, assume the following:
- There are two products, OptoSwitch 4 and OptoSwitch 16.
- OptoSwitch 4 provides 4 slots, which can be equipped with boards. OptoSwitch 16 provides 16 slots.
- There are single-width boards and double-width boards (which occupy two adjacent slots).
- A double-width board can only be equipped into "odd" slot numbers in OptoSwitch 16.
- Boards can have electrical interfaces or 
  a number of ports of certain types which can be equipped with transceivers of the same type.
- A module-carrier board can be equipped with modules,
  which in turn have electrical interfaces or can be equipped with transceivers.
- The optical switches can be mounted into racks.
  The height units used by the optical switches have to be respected.
- Racks contain additional fan trays which depend on the heat dissipation of the contained devices.
- Racks can contain an uninteruptible power supply (UPS). The dimensioning of the UPS depends on the used power.

...

- solution
- cables
- software
- licenses
- management system
- service

three different roles for maintenance of the product models:
- openCPQ modeling expert (JavaScript + openCPQ knowledge, models structure of each product)
- product manager (maintains tabular data for boards and transceivers)
- pricing manager (maintains prices of components)