openCPQ Demo - Optical-Networks Configurator
============================================

The hypothetical company OptoKom SE sells equipment for optical networks, e.g. optical switches.

Configuration Rules
-------------------

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

Configuation Modes
------------------

Three different modes of configuration should be implemented:
- Configuration of single products.
- Configuration of racks, which contain products and additional rack equipment.
- Configuration of a solution consisting of equipped racks, a network-management system, and additional service.
  The configuration should be facilitated with some top-level parameters.  

Maintenance of the Configurator
-------------------------------

The product models are maintained by three different roles:
- The openCPQ modeling expert models the structure of the configurator and the structure of each product.
  JavaScript and openCPQ knowledge is required, as well as some understanding of the configuration process and the products.
  This part of the configurator changes only when new products are introduced or products are changed heavily.
- The product manager maintains nearly-tabular data for the components (boards, modules, and transceivers).
  This nearly-tabular data is represented in JSON format (in file `resources/components.json`). This part of the configurator might change every month.
  It might be imported from a PDM system.
- The basic-data manager maintains materials with descriptions and prices in tabular form (as tab-separated values in file `resources/materials.tsv`).
  This data can change daily and should be loaded at each start of the configurator. It might be imported from an ERP system.
  
Running the Configurator in the Web
-----------------------------------

The configurator can be started from http://opencpq.webxcerpt.com/examples/optical-transport/.