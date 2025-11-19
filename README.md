# Modbus Explorer

## About

Modbus explorer is a lightweight cross platform GUI for interrogating Modbus TCP devices.

It supports reading and writing registers and converting from the native u16 data types to many other types.
Enter the address and port of your device and press Connect. Once connected any number of registers can be polled.
<img width="1241" height="770" alt="image" src="https://github.com/user-attachments/assets/89b00367-1525-41e4-aa96-7ec365ba2b44" />

### Data Conversion
Click the data type to select the data type to convert to.
<img width="165" height="334" alt="image" src="https://github.com/user-attachments/assets/0bd7e7d9-4185-4bf3-a811-2e23fed40a1d" />


## Intallation

### Windows

Standalone .exe and an installer are provided.

### Ubuntu

Binaries for ubuntu 24 and 22 are provided. 
Due to a change in the included  webkit2gtk-4.0 with these distros the correct one should be chosen. 
If you're on a version of ubuntu older than 24 then the 22 build should work.
Download the binary - navigate to the location in a terminal and make the file executable by running the command 
`chmod +x ModbusExplorer-ubuntu24`
to allow execution of the file. 
The file can now be double clicked in file explorer to run.
